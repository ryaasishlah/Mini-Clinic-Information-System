const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response');
const prisma = new PrismaClient();

const generateQueueNumber = async (polyclinicId) => {
  // Find polyclinic prefix
  const polyclinic = await prisma.polyclinic.findUnique({
    where: { id: parseInt(polyclinicId) }
  });
  const prefix = polyclinic?.prefix || 'Q';
  
  // Find last queue for this polyclinic today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastQueue = await prisma.queue.findFirst({
    where: {
      registration: {
        polyclinicId: polyclinicId
      },
      createdAt: {
        gte: today
      }
    },
    orderBy: {
      id: 'desc'
    }
  });

  let sequence = 1;
  if (lastQueue) {
    sequence = parseInt(lastQueue.queueNumber.substring(1), 10) + 1;
  }

  return `${prefix}${sequence.toString().padStart(3, '0')}`; // e.g., A001
};

const getQueues = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queues = await prisma.queue.findMany({
      where: {
        createdAt: {
          gte: today
        }
      },
      include: {
        registration: {
          include: {
            patient: { select: { name: true, medicalRecordNumber: true } },
            polyclinic: { select: { name: true } }
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    return successResponse(res, 200, 'Today queues retrieved successfully', queues);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Internal Server Error');
  }
};

const createQueue = async (req, res) => {
  try {
    const { registrationId } = req.body;

    if (!registrationId) {
      return errorResponse(res, 400, 'Validation Error', { detail: 'registrationId is required' });
    }

    const registration = await prisma.registration.findUnique({
      where: { id: parseInt(registrationId) }
    });

    if (!registration) {
      return errorResponse(res, 404, 'Registration not found');
    }

    // Check if queue already exists for this registration
    const existingQueue = await prisma.queue.findUnique({
      where: { registrationId: parseInt(registrationId) }
    });

    if (existingQueue) {
      return errorResponse(res, 400, 'Validation Error', { detail: 'Queue already exists for this registration' });
    }

    const queueNumber = await generateQueueNumber(registration.polyclinicId);

    const queue = await prisma.queue.create({
      data: {
        registrationId: parseInt(registrationId),
        queueNumber,
        status: 'WAITING'
      }
    });

    return successResponse(res, 201, 'Queue created successfully', queue);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Internal Server Error');
  }
};

const callQueue = async (req, res) => {
  try {
    const { id } = req.params;

    const queue = await prisma.queue.findUnique({ where: { id: parseInt(id) } });
    if (!queue) {
      return errorResponse(res, 404, 'Queue not found');
    }

    const updatedQueue = await prisma.queue.update({
      where: { id: parseInt(id) },
      data: {
        status: 'CALLED',
        calledAt: new Date()
      }
    });

    // Update Registration status to CHECK_IN or IN_PROGRESS
    await prisma.registration.update({
      where: { id: queue.registrationId },
      data: { status: 'IN_PROGRESS' }
    });

    return successResponse(res, 200, 'Queue called successfully', updatedQueue);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Internal Server Error');
  }
};

const updateQueueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // COMPLETED, SKIPPED

    if (!['COMPLETED', 'SKIPPED', 'WAITING'].includes(status)) {
      return errorResponse(res, 400, 'Validation Error', { detail: 'Invalid status' });
    }

    const queue = await prisma.queue.findUnique({ where: { id: parseInt(id) } });
    if (!queue) {
      return errorResponse(res, 404, 'Queue not found');
    }

    const updatedQueue = await prisma.queue.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    return successResponse(res, 200, 'Queue status updated successfully', updatedQueue);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Internal Server Error');
  }
};

module.exports = {
  getQueues,
  createQueue,
  callQueue,
  updateQueueStatus,
  generateQueueNumber
};

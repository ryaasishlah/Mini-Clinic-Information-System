const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response');
const prisma = new PrismaClient();

const getRegistrations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [registrations, total] = await Promise.all([
      prisma.registration.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: true,
          doctor: { select: { id: true, name: true, role: true } },
          polyclinic: true,
          queue: true
        }
      }),
      prisma.registration.count()
    ]);

    return successResponse(res, 200, 'Registrations retrieved successfully', {
      registrations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Internal Server Error');
  }
};

const createRegistration = async (req, res) => {
  try {
    const { patientId, doctorId, polyclinicId, paymentType, initialComplaint } = req.body;

    if (!patientId || !doctorId || !polyclinicId || !paymentType) {
      return errorResponse(res, 400, 'Validation Error', { detail: 'patientId, doctorId, polyclinicId, and paymentType are required' });
    }

    // Validate relationships
    const patient = await prisma.patient.findUnique({ where: { id: parseInt(patientId) } });
    if (!patient) return errorResponse(res, 404, 'Patient not found');

    const doctor = await prisma.user.findFirst({ where: { id: parseInt(doctorId), role: 'DOCTOR' } });
    if (!doctor) return errorResponse(res, 404, 'Doctor not found');

    const polyclinic = await prisma.polyclinic.findUnique({ where: { id: parseInt(polyclinicId) } });
    if (!polyclinic) return errorResponse(res, 404, 'Polyclinic not found');

    const registration = await prisma.registration.create({
      data: {
        patientId: parseInt(patientId),
        doctorId: parseInt(doctorId),
        polyclinicId: parseInt(polyclinicId),
        visitDate: new Date(),
        paymentType,
        initialComplaint: initialComplaint || '',
        status: 'WAITING'
      }
    });

    // Auto-generate queue number
    const { generateQueueNumber } = require('./queue.controller');
    const queueNumber = await generateQueueNumber(parseInt(polyclinicId));

    const queue = await prisma.queue.create({
      data: {
        registrationId: registration.id,
        queueNumber,
        status: 'WAITING'
      }
    });

    return successResponse(res, 201, 'Registration created successfully with Queue', { registration, queue });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Internal Server Error');
  }
};

const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // WAITING, CHECK_IN, IN_PROGRESS, COMPLETED

    const allowedStatuses = ['WAITING', 'CHECK_IN', 'IN_PROGRESS', 'COMPLETED'];
    if (!status || !allowedStatuses.includes(status)) {
      return errorResponse(res, 400, 'Validation Error', { detail: 'Invalid status' });
    }

    const registration = await prisma.registration.findUnique({ where: { id: parseInt(id) } });
    if (!registration) {
      return errorResponse(res, 404, 'Registration not found');
    }

    const updatedRegistration = await prisma.registration.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    return successResponse(res, 200, 'Registration status updated successfully', updatedRegistration);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Internal Server Error');
  }
};

module.exports = {
  getRegistrations,
  createRegistration,
  updateRegistrationStatus
};

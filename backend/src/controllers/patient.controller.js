const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response');
const prisma = new PrismaClient();

// Helper to generate Medical Record Number
const generateRM = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  
  // Find the last patient created today
  const lastPatient = await prisma.patient.findFirst({
    where: {
      medicalRecordNumber: {
        startsWith: `RM-${dateStr}`
      }
    },
    orderBy: {
      id: 'desc'
    }
  });

  let sequence = 1;
  if (lastPatient) {
    const lastSeq = parseInt(lastPatient.medicalRecordNumber.split('-')[2], 10);
    sequence = lastSeq + 1;
  }

  const sequenceStr = sequence.toString().padStart(4, '0');
  return `RM-${dateStr}-${sequenceStr}`;
};

const getPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { name: { contains: search } },
        { nik: { contains: search } },
        { medicalRecordNumber: { contains: search } }
      ]
    } : {};

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.patient.count({ where })
    ]);

    return successResponse(res, 200, 'Patients retrieved successfully', {
      patients,
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

const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) }
    });

    if (!patient) {
      return errorResponse(res, 404, 'Patient not found');
    }

    return successResponse(res, 200, 'Patient retrieved successfully', patient);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Internal Server Error');
  }
};

const createPatient = async (req, res) => {
  try {
    const { nik, name, gender, birthDate, phone, address } = req.body;

    // Basic Validation
    if (!nik || !name || !gender || !birthDate) {
      return errorResponse(res, 400, 'Validation Error', { detail: 'NIK, name, gender, and birthDate are required' });
    }

    // Check unique NIK
    const existingPatient = await prisma.patient.findUnique({ where: { nik } });
    if (existingPatient) {
      return errorResponse(res, 400, 'Validation Error', { nik: 'NIK already exists' });
    }

    const medicalRecordNumber = await generateRM();

    const patient = await prisma.patient.create({
      data: {
        medicalRecordNumber,
        nik,
        name,
        gender,
        birthDate: new Date(birthDate),
        phone,
        address
      }
    });

    return successResponse(res, 201, 'Patient created successfully', patient);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Internal Server Error');
  }
};

const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { nik, name, gender, birthDate, phone, address } = req.body;

    const existingPatient = await prisma.patient.findUnique({ where: { id: parseInt(id) } });
    if (!existingPatient) {
      return errorResponse(res, 404, 'Patient not found');
    }

    // Check unique NIK if NIK is being changed
    if (nik && nik !== existingPatient.nik) {
      const nikExists = await prisma.patient.findUnique({ where: { nik } });
      if (nikExists) {
        return errorResponse(res, 400, 'Validation Error', { nik: 'NIK already exists' });
      }
    }

    const updatedPatient = await prisma.patient.update({
      where: { id: parseInt(id) },
      data: {
        nik: nik || existingPatient.nik,
        name: name || existingPatient.name,
        gender: gender || existingPatient.gender,
        birthDate: birthDate ? new Date(birthDate) : existingPatient.birthDate,
        phone: phone !== undefined ? phone : existingPatient.phone,
        address: address !== undefined ? address : existingPatient.address
      }
    });

    return successResponse(res, 200, 'Patient updated successfully', updatedPatient);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Internal Server Error');
  }
};

const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPatient = await prisma.patient.findUnique({ where: { id: parseInt(id) } });
    if (!existingPatient) {
      return errorResponse(res, 404, 'Patient not found');
    }

    // Ensure we don't delete patients with existing registrations (or handle cascade)
    const registrations = await prisma.registration.findFirst({ where: { patientId: parseInt(id) } });
    if (registrations) {
       return errorResponse(res, 400, 'Validation Error', { detail: 'Cannot delete patient with existing registrations' });
    }

    await prisma.patient.delete({
      where: { id: parseInt(id) }
    });

    return successResponse(res, 200, 'Patient deleted successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Internal Server Error');
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};

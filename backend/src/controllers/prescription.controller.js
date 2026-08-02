const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response');
const prisma = new PrismaClient();

const createPrescription = async (req, res) => {
  try {
    const { medicalRecordId, prescriptions } = req.body; // array of prescriptions

    if (!medicalRecordId || !prescriptions || !Array.isArray(prescriptions)) {
      return errorResponse(res, 400, 'Validation Error', { detail: 'medicalRecordId and array of prescriptions are required' });
    }

    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { id: parseInt(medicalRecordId) }
    });

    if (!medicalRecord) {
      return errorResponse(res, 404, 'Medical record not found');
    }

    // create many prescriptions
    const createdPrescriptions = await prisma.$transaction(
      prescriptions.map(rx => prisma.prescription.create({
        data: {
          medicalRecordId: parseInt(medicalRecordId),
          medicineName: rx.medicineName,
          dosage: rx.dosage,
          quantity: parseInt(rx.quantity),
          notes: rx.notes
        }
      }))
    );

    return successResponse(res, 201, 'Prescriptions added successfully', createdPrescriptions);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Internal Server Error');
  }
};

const getPrescriptions = async (req, res) => {
  try {
    const { id } = req.params; // Can be medicalRecordId

    const prescriptions = await prisma.prescription.findMany({
      where: { medicalRecordId: parseInt(id) },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, 200, 'Prescriptions retrieved successfully', prescriptions);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Internal Server Error');
  }
};

module.exports = {
  createPrescription,
  getPrescriptions
};

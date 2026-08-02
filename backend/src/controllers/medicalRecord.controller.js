const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response');
const prisma = new PrismaClient();

const createMedicalRecord = async (req, res) => {
  try {
    const { 
      registrationId, 
      subjective, 
      objectiveBloodPressure, 
      objectiveTemperature, 
      objectiveWeight, 
      objectiveHeight, 
      assessmentDiagnosis, 
      planTherapy,
      actions, // array of { actionName, description }
      prescriptions // array of { medicineName, dosage, quantity, notes }
    } = req.body;

    if (!registrationId || !subjective || !assessmentDiagnosis || !planTherapy) {
      return errorResponse(res, 400, 'Validation Error', { detail: 'registrationId, subjective, assessmentDiagnosis, planTherapy are required' });
    }

    const registration = await prisma.registration.findUnique({
      where: { id: parseInt(registrationId) }
    });

    if (!registration) {
      return errorResponse(res, 404, 'Registration not found');
    }

    // Check if MR already exists
    const existingMR = await prisma.medicalRecord.findUnique({
      where: { registrationId: parseInt(registrationId) }
    });

    if (existingMR) {
      return errorResponse(res, 400, 'Validation Error', { detail: 'Medical record already exists for this registration' });
    }

    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        registrationId: parseInt(registrationId),
        patientId: registration.patientId,
        subjective,
        objectiveBloodPressure,
        objectiveTemperature: objectiveTemperature ? parseFloat(objectiveTemperature) : null,
        objectiveWeight: objectiveWeight ? parseFloat(objectiveWeight) : null,
        objectiveHeight: objectiveHeight ? parseFloat(objectiveHeight) : null,
        assessmentDiagnosis,
        planTherapy,
        actions: actions && actions.length > 0 ? {
          create: actions.map(act => ({
            actionName: act.actionName,
            description: act.description
          }))
        } : undefined,
        prescriptions: prescriptions && prescriptions.length > 0 ? {
          create: prescriptions.map(rx => ({
            medicineName: rx.medicineName,
            dosage: rx.dosage,
            quantity: parseInt(rx.quantity),
            notes: rx.notes
          }))
        } : undefined
      },
      include: {
        actions: true,
        prescriptions: true
      }
    });

    // Update Registration Status to COMPLETED
    await prisma.registration.update({
      where: { id: parseInt(registrationId) },
      data: { status: 'COMPLETED' }
    });

    // Also mark queue as COMPLETED if exists
    const queue = await prisma.queue.findUnique({ where: { registrationId: parseInt(registrationId) } });
    if (queue) {
      await prisma.queue.update({
        where: { id: queue.id },
        data: { status: 'COMPLETED' }
      });
    }

    return successResponse(res, 201, 'Medical record created successfully', medicalRecord);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Internal Server Error');
  }
};

const getMedicalRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const medicalRecords = await prisma.medicalRecord.findMany({
      where: { patientId: parseInt(patientId) },
      include: {
        registration: {
          include: {
            doctor: { select: { name: true } },
            polyclinic: { select: { name: true } }
          }
        },
        actions: true,
        prescriptions: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, 200, 'Medical records retrieved successfully', medicalRecords);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Internal Server Error');
  }
};

module.exports = {
  createMedicalRecord,
  getMedicalRecordsByPatient
};

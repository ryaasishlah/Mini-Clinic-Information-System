const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response');
const prisma = new PrismaClient();

const getPolyclinics = async (req, res) => {
  try {
    const polyclinics = await prisma.polyclinic.findMany({
      orderBy: { name: 'asc' }
    });
    return successResponse(res, 200, 'Polyclinics retrieved successfully', polyclinics);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Internal Server Error');
  }
};

const getDoctors = async (req, res) => {
  try {
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      select: { id: true, name: true, username: true },
      orderBy: { name: 'asc' }
    });
    return successResponse(res, 200, 'Doctors retrieved successfully', doctors);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Internal Server Error');
  }
};

module.exports = {
  getPolyclinics,
  getDoctors
};

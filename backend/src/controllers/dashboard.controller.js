const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response');
const prisma = new PrismaClient();

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalPatients,
      totalPatientsToday,
      totalQueuesToday,
      totalWaitingToday,
      totalCompletedToday
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.patient.count({
        where: { createdAt: { gte: today } }
      }),
      prisma.queue.count({
        where: { createdAt: { gte: today } }
      }),
      prisma.queue.count({
        where: { 
          createdAt: { gte: today },
          status: 'WAITING'
        }
      }),
      prisma.queue.count({
        where: { 
          createdAt: { gte: today },
          status: 'COMPLETED'
        }
      })
    ]);

    const stats = {
      totalPatients,
      totalPatientsToday,
      totalQueuesToday,
      totalWaitingToday,
      totalCompletedToday
    };

    return successResponse(res, 200, 'Dashboard stats retrieved successfully', stats);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Internal Server Error');
  }
};

module.exports = {
  getDashboardStats
};

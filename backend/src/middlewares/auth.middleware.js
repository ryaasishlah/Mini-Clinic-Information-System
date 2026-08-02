const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Unauthorized: Token is missing or invalid format');
    }

    const token = authHeader.split(' ')[1];
    
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in .env");
      return errorResponse(res, 500, 'Internal Server Error: Missing JWT Secret');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Pastikan user masih ada di database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return errorResponse(res, 401, 'Unauthorized: User no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Unauthorized: Token has expired');
    }
    return errorResponse(res, 401, 'Unauthorized: Invalid token');
  }
};

const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, 403, 'Forbidden: You do not have permission to access this resource');
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};

const jwt = require('jsonwebtoken');
const { User } = require('../models/postgres');

// Protect routes - verificar si el usuario está autenticado
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, token no encontrado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'No autorizado, token inválido' });
  }
};

// Authorize roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `El rol ${req.user.role} no tiene permiso para acceder a este recurso`
      });
    }
    next();
  };
};

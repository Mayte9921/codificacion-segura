// middleware/auth.js
// Middleware para verificar tokens JWT en rutas protegidas

const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  // Obtener el token del header Authorization
  const encabezado = req.headers.authorization;
  
  // Verificar que el token existe y tiene el formato correcto
  if (!encabezado || !encabezado.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Token no proporcionado',
      mensaje: 'Debes incluir un token JWT en el header Authorization' 
    });
  }

  // Extraer el token (eliminar "Bearer ")
  const token = encabezado.split(' ')[1];
  
  try {
    // Verificar y decodificar el token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Adjuntar la información del usuario a la request
    req.usuario = payload;
    next(); // Continuar con la siguiente función
  } catch (error) {
    // Token inválido o expirado
    return res.status(401).json({ 
      error: 'Token inválido o expirado',
      mensaje: 'El token no es válido o ha caducado' 
    });
  }
}

module.exports = verificarToken;
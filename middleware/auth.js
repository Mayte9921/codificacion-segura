// middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar el token JWT
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función next de Express
 */
function verificarToken(req, res, next) {
    // 1. Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    
    // 2. Verificar que el header exista y tenga el formato "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            exito: false,
            mensaje: 'Token no proporcionado o formato inválido. Debe ser: Bearer <token>'
        });
    }

    // 3. Extraer el token (eliminar "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
        // 4. Verificar y decodificar el token usando el JWT_SECRET
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        
        // 5. Adjuntar los datos del usuario al objeto req para que estén disponibles
        // en los siguientes middlewares o controladores
        req.usuario = payload;
        
        // 6. Pasar al siguiente middleware/controlador
        next();
    } catch (error) {
        // 7. Manejar errores de verificación del token
        let mensaje = 'Token inválido o expirado';
        
        if (error.name === 'TokenExpiredError') {
            mensaje = 'Token expirado. Por favor, inicia sesión nuevamente';
        } else if (error.name === 'JsonWebTokenError') {
            mensaje = 'Token inválido. Verifica que sea correcto';
        }
        
        return res.status(401).json({
            exito: false,
            mensaje: mensaje,
            error: error.message
        });
    }
}

module.exports = verificarToken;
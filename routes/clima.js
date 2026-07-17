// routes/clima.js
// Endpoint independiente para consultar el clima

const express = require('express');
const router = express.Router();
const { param, validationResult } = require('express-validator');
const { obtenerClima } = require('../services/climaService');
const verificarToken = require('../middleware/auth');

// Middleware de validación
function validar(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  next();
}

// ✅ Ruta protegida con autenticación
router.use(verificarToken);

// GET /api/clima/:ciudad - Clima de una ciudad (independiente de tareas)
router.get(
  '/:ciudad',
  param('ciudad')
    .isString()
    .trim()
    .isLength({ min: 1, max: 60 })
    .withMessage('La ciudad debe tener entre 1 y 60 caracteres')
    .escape(),
  validar,
  async (req, res) => {
    try {
      const clima = await obtenerClima(req.params.ciudad);
      res.status(200).json({
        success: true,
        data: clima,
        mensaje: `Clima obtenido para ${req.params.ciudad}`
      });
    } catch (error) {
      res.status(502).json({ 
        error: 'Error con el servicio externo de clima',
        mensaje: error.message 
      });
    }
  }
);

module.exports = router;
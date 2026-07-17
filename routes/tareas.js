// routes/tareas.js
// Rutas CRUD para tareas con integración de clima

const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const tareasModel = require('../models/tareas');
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

// ✅ Todas las rutas de tareas requieren autenticación
router.use(verificarToken);

// GET /api/tareas - Listar todas las tareas
router.get('/', (req, res) => {
  res.status(200).json(tareasModel.obtenerTodas());
});

// GET /api/tareas/:id - Obtener una tarea por ID
router.get(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  validar,
  (req, res) => {
    const tarea = tareasModel.obtenerPorId(Number(req.params.id));
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.status(200).json(tarea);
  }
);

// POST /api/tareas - Crear una nueva tarea
router.post(
  '/',
  body('titulo')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El título debe tener entre 1 y 100 caracteres')
    .escape(), // Prevenir XSS
  validar,
  (req, res) => {
    const nueva = tareasModel.crear(req.body.titulo);
    res.status(201).json(nueva);
  }
);

// PUT /api/tareas/:id - Actualizar una tarea
router.put(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  body('titulo')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El título debe tener entre 1 y 100 caracteres')
    .escape(),
  body('completada')
    .optional()
    .isBoolean()
    .withMessage('completada debe ser true o false'),
  validar,
  (req, res) => {
    const actualizada = tareasModel.actualizar(Number(req.params.id), req.body);
    if (!actualizada) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.status(200).json(actualizada);
  }
);

// DELETE /api/tareas/:id - Eliminar una tarea
router.delete(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  validar,
  (req, res) => {
    const eliminada = tareasModel.eliminar(Number(req.params.id));
    if (!eliminada) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.status(204).send(); // No content
  }
);

// GET /api/tareas/:id/clima?ciudad=Madrid - Combina tarea + clima externo
router.get(
  '/:id/clima',
  param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  validar,
  async (req, res) => {
    const tarea = tareasModel.obtenerPorId(Number(req.params.id));
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    // Obtener ciudad de query param o usar valor por defecto
    const ciudad = req.query.ciudad || 'Ciudad de Mexico';

    try {
      const clima = await obtenerClima(ciudad);
      res.status(200).json({ 
        tarea, 
        clima,
        mensaje: `Clima obtenido para ${ciudad}`
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
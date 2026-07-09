// routes/tareas.js
const express = require('express');
const router = express.Router();
const tareasModel = require('../models/tareasModel');
const { body, param, validationResult } = require('express-validator');

// 📋 GET - Listar todas las tareas
router.get('/', (req, res) => {
    const tareas = tareasModel.obtenerTodas();
    res.status(200).json(tareas);
});

// 📋 GET - Obtener tarea por ID
router.get('/:id', 
    param('id').isInt().withMessage('ID debe ser un número entero'),
    (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() });
        }

        const id = parseInt(req.params.id);
        const tarea = tareasModel.obtenerPorId(id);
        
        if (!tarea) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        
        res.status(200).json(tarea);
    }
);

// ➕ POST - Crear nueva tarea
router.post('/',
    body('titulo').isString().trim().isLength({ min: 1, max: 100 }).escape(),
    body('descripcion').optional().isString().trim().escape(),
    (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() });
        }

        const nuevaTarea = tareasModel.crear(req.body);
        res.status(201).json(nuevaTarea);
    }
);

// ✏️ PUT - Actualizar tarea existente
router.put('/:id',
    param('id').isInt().withMessage('ID debe ser un número entero'),
    body('titulo').optional().isString().trim().isLength({ min: 1, max: 100 }).escape(),
    body('descripcion').optional().isString().trim().escape(),
    body('completada').optional().isBoolean(),
    (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() });
        }

        const id = parseInt(req.params.id);
        const tareaActualizada = tareasModel.actualizar(id, req.body);
        
        if (!tareaActualizada) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        
        res.status(200).json(tareaActualizada);
    }
);

// 🗑️ DELETE - Eliminar tarea (✅ NUEVO - lo que te pidieron)
router.delete('/:id',
    param('id').isInt().withMessage('ID debe ser un número entero'),
    (req, res) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() });
        }

        const id = parseInt(req.params.id);
        const eliminado = tareasModel.eliminar(id);
        
        // Si no existe, responde 404
        if (!eliminado) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        
        // Si se eliminó, responde 204 (sin contenido)
        res.status(204).send();
    }
);

module.exports = router;
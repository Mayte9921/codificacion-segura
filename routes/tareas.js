// routes/tareas.js
const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const tareasModel = require('../models/tareas');
const { obtenerClima } = require('../services/climaService');

// Helper para validar errores
function validar(req, res, next) {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
}

// ============================================
// 📋 RUTAS CRUD DE TAREAS
// ============================================

// GET /api/tareas — listar todas
router.get('/', (req, res) => {
    res.status(200).json({
        exito: true,
        datos: tareasModel.obtenerTodas(),
        total: tareasModel.obtenerTodas().length
    });
});

// GET /api/tareas/:id — obtener una
router.get(
    '/:id',
    param('id').isInt().withMessage('El ID debe ser un número entero'),
    validar,
    (req, res) => {
        const tarea = tareasModel.obtenerPorId(Number(req.params.id));
        if (!tarea) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        res.status(200).json({
            exito: true,
            datos: tarea
        });
    }
);

// POST /api/tareas — crear
router.post(
    '/',
    [
        body('titulo')
            .isString()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('El título debe tener entre 1 y 100 caracteres')
            .escape()
    ],
    validar,
    (req, res) => {
        const { titulo, descripcion, estado } = req.body;
        const nueva = tareasModel.crear(titulo, descripcion, estado);
        res.status(201).json({
            exito: true,
            mensaje: 'Tarea creada exitosamente',
            datos: nueva
        });
    }
);

// PUT /api/tareas/:id — actualizar
router.put(
    '/:id',
    [
        param('id').isInt().withMessage('El ID debe ser un número entero'),
        body('titulo')
            .optional()
            .isString()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('El título debe tener entre 1 y 100 caracteres')
            .escape(),
        body('estado')
            .optional()
            .isIn(['pendiente', 'completada', 'en progreso'])
            .withMessage('Estado inválido')
    ],
    validar,
    (req, res) => {
        const actualizada = tareasModel.actualizar(Number(req.params.id), req.body);
        if (!actualizada) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        res.status(200).json({
            exito: true,
            mensaje: 'Tarea actualizada exitosamente',
            datos: actualizada
        });
    }
);

// DELETE /api/tareas/:id — eliminar
router.delete(
    '/:id',
    param('id').isInt().withMessage('El ID debe ser un número entero'),
    validar,
    (req, res) => {
        const eliminada = tareasModel.eliminar(Number(req.params.id));
        if (!eliminada) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        res.status(204).send();
    }
);

// ============================================
// 🌤️ ENDPOINT COMBINADO (TAREA + CLIMA)
// ============================================

// ✅ CORREGIDO: Ahora la ciudad va en la URL: /api/tareas/:id/clima/:ciudad
router.get(
    '/:id/clima/:ciudad',  // <--- CAMBIO CLAVE: ahora :ciudad es parte de la URL
    [
        param('id').isInt().withMessage('El ID debe ser un número entero'),
        param('ciudad')    // <--- NUEVA VALIDACIÓN para la ciudad
            .isString()
            .trim()
            .isLength({ min: 1, max: 60 })
            .withMessage('La ciudad debe tener entre 1 y 60 caracteres')
            .matches(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s\-]+$/)
            .withMessage('La ciudad solo debe contener letras, espacios o guiones')
            .escape()
    ],
    validar,
    async (req, res) => {
        // 1. Obtener el ID de la tarea y la ciudad desde los parámetros de la URL
        const tareaId = Number(req.params.id);
        const ciudad = req.params.ciudad;  // <--- La ciudad viene de la URL

        // 2. Buscar la tarea
        const tarea = tareasModel.obtenerPorId(tareaId);
        if (!tarea) {
            return res.status(404).json({ 
                exito: false,
                error: `Tarea con ID ${tareaId} no encontrada` 
            });
        }

        try {
            // 3. Obtener el clima usando el servicio
            const clima = await obtenerClima(ciudad);
            
            // 4. Combinar y responder
            res.status(200).json({
                exito: true,
                tarea: {
                    id: tarea.id,
                    titulo: tarea.titulo,
                    descripcion: tarea.descripcion,
                    estado: tarea.estado,
                    createdAt: tarea.createdAt
                },
                clima: clima,
                mensaje: `📋 Tarea "${tarea.titulo}" - 🌤️ Clima en ${ciudad}: ${clima.temperatura}°C`
            });
        } catch (error) {
            // Manejar errores del servicio de clima
            console.error('Error al obtener clima:', error.message);
            res.status(502).json({ 
                exito: false, 
                error: error.message || 'Error al obtener el clima del servicio externo'
            });
        }
    }
);

module.exports = router;
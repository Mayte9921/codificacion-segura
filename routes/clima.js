// routes/clima.js
const express = require('express');
const router = express.Router();
const { param, validationResult } = require('express-validator');
const { obtenerClima } = require('../services/climaService');

function validar(req, res, next) {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
}

// GET /api/clima/:ciudad — clima de una ciudad (independiente)
router.get(
    '/:ciudad',
    [
        param('ciudad')
            .isString()
            .trim()
            .isLength({ min: 1, max: 60 })
            .withMessage('La ciudad debe tener entre 1 y 60 caracteres')
            .escape()
    ],
    validar,
    async (req, res) => {
        try {
            const clima = await obtenerClima(req.params.ciudad);
            res.status(200).json({
                exito: true,
                datos: clima
            });
        } catch (error) {
            res.status(502).json({ 
                exito: false, 
                error: error.message || 'Error al obtener el clima' 
            });
        }
    }
);

module.exports = router;
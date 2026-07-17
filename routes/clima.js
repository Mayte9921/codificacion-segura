// routes/clima.js
const express = require('express');
const { param, validationResult } = require('express-validator');
const climaService = require('../services/climaService');

const router = express.Router();

// GET /api/clima/:ciudad
router.get('/:ciudad', [
    param('ciudad')
        .trim()
        .notEmpty().withMessage('El parámetro ciudad no puede estar vacío')
        .isAlpha('es-ES', { ignore: ' ' }).withMessage('La ciudad solo puede contener letras y espacios')
        .isLength({ min: 2, max: 50 }).withMessage('La ciudad debe tener entre 2 y 50 caracteres')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Parámetros inválidos', detalles: errors.array() });
    }

    try {
        const { ciudad } = req.params;
        const clima = await climaService.obtenerClima(ciudad);
        res.json({ success: true, data: clima });
    } catch (error) {
        if (error.message.includes('servicio de clima') || error.message.includes('no responde')) {
            return res.status(502).json({ error: 'Error con el servicio externo de clima', mensaje: error.message });
        }
        res.status(500).json({ error: 'Error interno del servidor', mensaje: error.message });
    }
});

module.exports = router;
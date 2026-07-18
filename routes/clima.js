// routes/clima.js
const express = require('express');
const { param, validationResult } = require('express-validator');
const { obtenerClima } = require('../services/climaService');

const router = express.Router();

/**
 * GET /api/clima/:ciudad
 * Endpoint independiente para obtener el clima de cualquier ciudad
 * 
 * Ejemplo: GET /api/clima/Madrid
 * Ejemplo: GET /api/clima/Londres
 * Ejemplo: GET /api/clima/Buenos%20Aires (ciudades con espacios)
 */
router.get(
    '/:ciudad',
    [
        param('ciudad')
            .trim()
            .notEmpty().withMessage('El parámetro ciudad no puede estar vacío')
            .isLength({ min: 2, max: 100 }).withMessage('La ciudad debe tener entre 2 y 100 caracteres')
            .matches(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s\-]+$/).withMessage('La ciudad solo debe contener letras, espacios o guiones')
            .escape()
    ],
    async (req, res) => {
        // Validar la entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                exito: false,
                errores: errors.array().map(err => ({
                    campo: err.param,
                    mensaje: err.msg
                }))
            });
        }

        const ciudad = req.params.ciudad;

        try {
            const datosClima = await obtenerClima(ciudad);
            
            res.json({
                exito: true,
                datos: datosClima
            });
        } catch (error) {
            // El servicio lanza errores con código HTTP específico
            const statusCode = error.codigo || 502;
            res.status(statusCode).json({
                exito: false,
                mensaje: error.message || 'Error al obtener el clima',
                codigo: statusCode
            });
        }
    }
);

module.exports = router;
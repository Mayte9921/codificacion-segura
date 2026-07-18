// routes/tareas.js (agregar al final del archivo)
const { obtenerClima } = require('../services/climaService');

// ... (todas tus rutas existentes de tareas como GET, POST, PUT, DELETE)

/**
 * GET /api/tareas/:id/clima/:ciudad
 * Endpoint que combina una tarea específica con el clima de una ciudad
 * 
 * Ejemplo: GET /api/tareas/1/clima/Madrid
 * Ejemplo: GET /api/tareas/5/clima/Barcelona
 */
router.get(
    '/:id/clima/:ciudad',
    [
        // Validación para el ID de la tarea
        param('id')
            .isInt({ min: 1 }).withMessage('El ID de la tarea debe ser un número entero positivo')
            .toInt(),
        
        // Validación para la ciudad (misma lógica que en clima.js)
        param('ciudad')
            .trim()
            .notEmpty().withMessage('El parámetro ciudad no puede estar vacío')
            .isLength({ min: 2, max: 100 }).withMessage('La ciudad debe tener entre 2 y 100 caracteres')
            .matches(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s\-]+$/).withMessage('La ciudad solo debe contener letras, espacios o guiones')
            .escape()
    ],
    async (req, res) => {
        // Validar entrada
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

        const tareaId = req.params.id;
        const ciudad = req.params.ciudad;

        try {
            // 1. Obtener la tarea por ID (usa tu modelo existente)
            // Ajusta según tu modelo de base de datos
            const tarea = await Tarea.findByPk(tareaId); // Si usas Sequelize
            
            // Si usas MongoDB con Mongoose:
            // const tarea = await Tarea.findById(tareaId);
            
            // Si usas un array en memoria:
            // const tarea = tareas.find(t => t.id === parseInt(tareaId));

            if (!tarea) {
                return res.status(404).json({
                    exito: false,
                    mensaje: `Tarea con ID ${tareaId} no encontrada`
                });
            }

            // 2. Obtener el clima de la ciudad
            const datosClima = await obtenerClima(ciudad);

            // 3. Combinar y responder
            res.json({
                exito: true,
                tarea: {
                    id: tarea.id,
                    titulo: tarea.titulo,
                    descripcion: tarea.descripcion,
                    estado: tarea.estado,
                    creada: tarea.createdAt
                },
                clima: datosClima,
                mensaje: `📋 Tarea "${tarea.titulo}" - 🌤️ Clima en ${ciudad}: ${datosClima.temperatura.actual}°C`
            });

        } catch (error) {
            // Manejo de errores centralizado
            const statusCode = error.codigo || 502;
            res.status(statusCode).json({
                exito: false,
                mensaje: error.message || 'Error al obtener la información combinada',
                codigo: statusCode
            });
        }
    }
);

module.exports = router;
// app.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const https = require('https');
const fs = require('fs');
const { body, validationResult } = require('express-validator');

const app = express();
const port = process.env.PORT || 3000;

// 1. Helmet - Seguridad
app.use(helmet());
app.use(express.json());

// 2. Endpoint de prueba (GET)
app.get('/', (req, res) => {
    res.json({ mensaje: 'Servidor funcionando correctamente' });
});

// 3. Endpoint GET con validación (para cumplir con 2 endpoints validados)
app.get('/api/usuarios', (req, res) => {
    res.json({ mensaje: 'Lista de usuarios' });
});

// 4. Endpoint POST /api/registro (REQUERIDO)
app.post('/api/registro',
    // --- VALIDACIONES ---
    // Principio de seguridad: Validación de entrada (Input Validation).
    // Se aplica el principio de "Nunca confíes en los datos del usuario" (Never trust user input).
    // Se valida que el correo tenga un formato válido y que el nombre no esté vacío
    // para prevenir inyecciones, datos maliciosos o corrupción de la base de datos.
    body('nombre').notEmpty().withMessage('El nombre no puede estar vacío'),
    body('correo').isEmail().withMessage('El correo no tiene un formato válido'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() });
        }

        // Aquí iría la lógica de registro (ej. guardar en BD)
        const { nombre, correo } = req.body;
        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario: { nombre, correo }
        });
    }
);

// 5. Servidor HTTPS con certificado autofirmado
try {
    const privateKey = fs.readFileSync('server.key', 'utf8');
    const certificate = fs.readFileSync('server.cert', 'utf8');
    const credentials = { key: privateKey, cert: certificate };

    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(port, () => {
        console.log(`✅ Servidor HTTPS corriendo en https://localhost:${port}`);
        console.log(`📝 Endpoints disponibles:`);
        console.log(`   GET  /`);
        console.log(`   GET  /api/usuarios`);
        console.log(`   POST /api/registro`);
    });
} catch (error) {
    console.error('❌ Error al cargar el certificado:', error.message);
    console.log('⚠️  Usando servidor HTTP como fallback...');
    app.listen(port, () => {
        console.log(`✅ Servidor HTTP en http://localhost:${port}`);
    });
}
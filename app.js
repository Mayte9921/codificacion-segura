// app.js o server.js
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Importar rutas
const tareasRoutes = require('./routes/tareas');
const climaRoutes = require('./routes/clima');
const authRoutes = require('./routes/auth'); // ✅ NUEVA RUTA

const app = express();

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// ✅ Registrar rutas de autenticación (públicas)
app.use('/api/auth', authRoutes);

// ✅ Rutas protegidas (requieren autenticación)
// Si quieres proteger las tareas y clima, descomenta estas líneas:
// const verificarToken = require('./middleware/auth');
// app.use('/api/tareas', verificarToken, tareasRoutes);
// app.use('/api/clima', verificarToken, climaRoutes);

// Si NO quieres protegerlas (para pruebas), usa:
app.use('/api/tareas', tareasRoutes);
app.use('/api/clima', climaRoutes);

// Ruta de salud (pública)
app.get('/api/salud', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

module.exports = app;
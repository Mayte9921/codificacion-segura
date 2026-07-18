// app.js o index.js (modifica tu archivo existente)
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Importar rutas existentes
const tareaRoutes = require('./routes/tareas');
const authRoutes = require('./routes/auth'); // Si tienes autenticación

// Importar NUEVA ruta de clima
const climaRoutes = require('./routes/clima');

const app = express();

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Rutas
app.use('/api/tareas', tareaRoutes);
app.use('/api/auth', authRoutes); // Si tienes auth
app.use('/api/clima', climaRoutes); // <--- NUEVA RUTA

// Ruta de salud
app.get('/api/salud', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

module.exports = app;
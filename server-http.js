// server-http.js
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// RUTAS DIRECTAS - prueba esto primero
const climaRoutes = require('./routes/clima');
const tareasRoutes = require('./routes/tareas');

app.use('/api/clima', climaRoutes);
app.use('/api/tareas', tareasRoutes);

// Ruta de prueba
app.get('/api/salud', (req, res) => {
    res.json({ status: 'ok', mensaje: 'Servidor funcionando' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🌤️  Clima: http://localhost:${PORT}/api/clima/Madrid`);
    console.log(`📋 Tareas: http://localhost:${PORT}/api/tareas`);
});
// app.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');

// IMPORTAR rutas de tareas
const tareasRoutes = require('./routes/tareas');

const app = express();

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// MONTAR rutas de tareas
app.use('/api/tareas', tareasRoutes);

// Ruta de prueba - Sesión 1
app.post(
  '/api/echo',
  body('mensaje').isString().trim().isLength({ min: 1, max: 200 }).escape(),
  (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }
    res.json({ recibido: req.body.mensaje });
  }
);

// Ruta de salud - Sesión 1
app.get('/api/salud', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
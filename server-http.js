// server-http.js
// Servidor HTTP para desarrollo (sin HTTPS)

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Importar rutas
const authRoutes = require('./routes/auth');
const tareasRoutes = require('./routes/tareas');
const climaRoutes = require('./routes/clima');

// Rutas públicas
app.use('/api/auth', authRoutes);

// Rutas protegidas (requieren autenticación)
app.use('/api/tareas', tareasRoutes);
app.use('/api/clima', climaRoutes);

// Ruta de salud (pública)
app.get('/api/salud', (req, res) => {
  res.json({ 
    status: 'ok',
    mensaje: 'Servidor funcionando correctamente'
  });
});

// Ruta de prueba de validación (pública)
app.post(
  '/api/echo',
  require('express-validator').body('mensaje')
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .escape(),
  (req, res) => {
    const errores = require('express-validator').validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }
    res.json({ recibido: req.body.mensaje });
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔓 Servidor HTTP corriendo en http://localhost:${PORT}`);
  console.log(`📋 Endpoints públicos:`);
  console.log(`   POST /api/auth/registro - Registrar usuario`);
  console.log(`   POST /api/auth/login    - Iniciar sesión`);
  console.log(`   GET  /api/salud         - Verificar estado`);
  console.log(`📋 Endpoints protegidos (requieren token JWT):`);
  console.log(`   GET    /api/tareas              - Listar tareas`);
  console.log(`   GET    /api/tareas/:id          - Obtener tarea`);
  console.log(`   POST   /api/tareas              - Crear tarea`);
  console.log(`   PUT    /api/tareas/:id          - Actualizar tarea`);
  console.log(`   DELETE /api/tareas/:id          - Eliminar tarea`);
  console.log(`   GET    /api/tareas/:id/clima    - Tarea + clima`);
  console.log(`   GET    /api/clima/:ciudad       - Clima independiente`);
});
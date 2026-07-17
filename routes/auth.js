// routes/auth.js
// Rutas de autenticación: registro, login y perfil

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const usuariosModel = require('../models/usuarios');
const verificarToken = require('../middleware/auth');

// Middleware para validar y manejar errores de validación
function validar(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  next();
}

// POST /api/auth/registro - Registrar un nuevo usuario
router.post(
  '/registro',
  [
    body('correo')
      .isEmail()
      .withMessage('Debe ser un correo electrónico válido')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres')
  ],
  validar,
  async (req, res) => {
    const { correo, password } = req.body;
    
    // Verificar si el correo ya está registrado
    if (usuariosModel.buscarPorCorreo(correo)) {
      return res.status(409).json({ 
        error: 'El correo ya está registrado' 
      });
    }
    
    // Hash de la contraseña
    const hash = await bcrypt.hash(password, 10);
    
    // Crear el usuario
    const usuario = usuariosModel.crear(correo, hash);
    
    // Responder sin enviar la contraseña
    res.status(201).json({ 
      id: usuario.id, 
      correo: usuario.correo,
      mensaje: 'Usuario registrado exitosamente'
    });
  }
);

// POST /api/auth/login - Iniciar sesión
router.post(
  '/login',
  [
    body('correo')
      .isEmail()
      .withMessage('Debe ser un correo electrónico válido')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida')
  ],
  validar,
  async (req, res) => {
    const { correo, password } = req.body;
    
    // Buscar el usuario
    const usuario = usuariosModel.buscarPorCorreo(correo);
    if (!usuario) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas',
        mensaje: 'Correo o contraseña incorrectos'
      });
    }

    // Verificar la contraseña
    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas',
        mensaje: 'Correo o contraseña incorrectos'
      });
    }

    // Generar el token JWT
    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(200).json({ 
      token,
      usuario: {
        id: usuario.id,
        correo: usuario.correo
      },
      mensaje: 'Login exitoso'
    });
  }
);

// GET /api/auth/perfil - Obtener el perfil del usuario autenticado
router.get('/perfil', verificarToken, (req, res) => {
  res.status(200).json({ 
    usuario: req.usuario,
    mensaje: 'Perfil obtenido exitosamente'
  });
});

module.exports = router;

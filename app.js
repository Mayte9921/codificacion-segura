const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = 3000;

app.use(express.json());

app.post(
  '/api/registro',
  [
    body('nombre')
      .notEmpty()
      .withMessage('El nombre no puede estar vacío'),

    body('correo')
      .isEmail()
      .withMessage('El correo debe tener un formato válido')
  ],
  (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      return res.status(400).json({
        errores: errores.array()
      });
    }

    const { nombre, correo } = req.body;

    /*
      Principio de codificación segura:
      Se validan los datos de entrada antes de procesarlos para evitar
      información inválida o maliciosa y proteger la integridad de la aplicación.
    */

    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      nombre,
      correo
    });
  }
);

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
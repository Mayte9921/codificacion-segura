# Sesión 1 — Codificación Segura y Certificados

**Unidad III: Integración de componentes de software para aplicaciones Web**
**Proyecto integrador:** API de gestión de tareas con clima (Node.js + Express)

## Datos generales


| Campo                      | Detalle                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------- |
| Duración                  | 2 horas (120 min)                                                                     |
| Tema curricular            | Especificación de principios de codificación segura                                 |
| Saber hacer que cubre      | Implementar mecanismos de seguridad en el desarrollo WEB                              |
| Instrumento de evaluación | Lista de cotejo + evidencia de repositorio                                            |
| Requisitos previos         | Node.js LTS instalado, VS Code, Postman, Git, OpenSSL (viene con Git Bash en Windows) |

## Objetivo de la sesión

Al finalizar, el alumno tendrá un servidor Express funcional con:

- Cabeceras de seguridad HTTP configuradas (Helmet)
- Manejo seguro de variables sensibles (dotenv)
- Validación de entradas del usuario (express-validator)
- Comunicación cifrada vía HTTPS con certificado autofirmado
- El proyecto versionado en un repositorio Git

### Inicializar el proyecto

```bash
mkdir tareas-clima-api && cd tareas-clima-api
npm init -y
npm install express helmet dotenv express-validator morgan
npm install --save-dev nodemon
git init
```

### Variables de entorno (`.env`)

```
PORT=3000
NODE_ENV=development
```

```
node_modules/
.env
*.pem
```

### Servidor básico con cabeceras de seguridad (`server.js`)

```javascript
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');

const app = express();

app.use(helmet());              // cabeceras de seguridad HTTP
app.use(express.json());        // parseo seguro de JSON
app.use(morgan('dev'));         // bitácora de peticiones

// Ruta de prueba con validación de entrada
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

app.get('/api/salud', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
```

Puntos a resaltar en la demo:

- `helmet()` agrega automáticamente cabeceras como `X-Content-Type-Options`, `X-Frame-Options`, etc. Mostrar en Postman el "antes y después" quitando/poniendo helmet.
- `express-validator` evita que datos maliciosos o mal formados lleguen a la lógica de negocio (principio de *nunca confiar en la entrada del usuario*).
- `.escape()` neutraliza caracteres que podrían usarse en inyección de HTML/script.

### Certificado autofirmado y arranque con HTTPS

```bash
openssl req -nodes -new -x509 -keyout server.key -out server.cert -days 365
```

`index.js` (punto de entrada con HTTPS):

```javascript
const https = require('https');
const fs = require('fs');
const app = require('./server');

const opciones = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

const PORT = process.env.PORT || 3000;

https.createServer(opciones, app).listen(PORT, () => {
  console.log(`Servidor seguro corriendo en https://localhost:${PORT}`);
});
```

Agregar en `package.json`:

```json
"scripts": {
  "dev": "nodemon index.js"
}
```

Probar en Postman: `https://localhost:3000/api/salud`

## Reto de la sesión (actividad guiada del alumno)

1. Clonar/replicar la estructura anterior.
2. Agregar un endpoint `POST /api/registro` que reciba `nombre` y `correo`, valide que el correo tenga formato válido (`isEmail()`) y que el nombre no esté vacío.
3. Justificar en un comentario del código **qué principio de codificación segura** aplica esa validación.

## Entregable y lista de cotejo

El alumno entrega: enlace al repositorio con el primer commit.


| Criterio                                                                                | Cumple |
| --------------------------------------------------------------------------------------- | ------ |
| El servidor usa Helmet                                                                  | ☐     |
| Existe archivo`.env` y está en `.gitignore`                                            | ☐     |
| Al menos dos endpoints tienen validación con express-validator                         | ☐     |
| El servidor corre sobre HTTPS con certificado autofirmado                               | ☐     |
| El repositorio tiene el primer commit con estructura del proyecto                       | ☐     |
| El alumno puede explicar oralmente qué vulnerabilidad previene cada mecanismo aplicado | ☐     |

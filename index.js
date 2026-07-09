// index.js
const https = require('https');
const fs = require('fs');
const app = require('./app');

// Configuración HTTPS con certificados autofirmados
const opciones = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
};

const PORT = process.env.PORT || 3000;

https.createServer(opciones, app).listen(PORT, () => {
    console.log(`🔒 Servidor seguro corriendo en https://localhost:${PORT}`);
    console.log(`📝 Nota: Acepta la advertencia del certificado en el navegador`);
    console.log(`✅ API de tareas disponible en https://localhost:${PORT}/api/tareas`);
});
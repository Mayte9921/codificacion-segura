// server-http.js
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🔓 Servidor HTTP corriendo en http://localhost:${PORT}`);
    console.log(`✅ API de tareas disponible en http://localhost:${PORT}/api/tareas`);
    console.log(`📝 Endpoints disponibles:`);
    console.log(`   GET    /api/tareas        - Listar todas las tareas`);
    console.log(`   GET    /api/tareas/:id    - Obtener tarea por ID`);
    console.log(`   POST   /api/tareas        - Crear nueva tarea`);
    console.log(`   PUT    /api/tareas/:id    - Actualizar tarea`);
    console.log(`   DELETE /api/tareas/:id    - Eliminar tarea (NUEVO)`);
    console.log(`   GET    /api/salud         - Verificar estado`);
});
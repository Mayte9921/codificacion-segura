// ... (tus imports existentes)
const tareasRoutes = require('./routes/tareas');
const climaRoutes = require('./routes/clima');

// ... (tu código existente)

// Registrar las nuevas rutas
app.use('/api/tareas', tareasRoutes);
app.use('/api/clima', climaRoutes);


// models/tareasModel.js
// Modelo de tareas - Simula una base de datos en memoria

let tareas = [];
let idCounter = 1;

// Obtener todas las tareas
function obtenerTodas() {
    return tareas;
}

// Obtener tarea por ID
function obtenerPorId(id) {
    return tareas.find(t => t.id === id);
}

// Crear nueva tarea
function crear(datos) {
    const nuevaTarea = {
        id: idCounter++,
        titulo: datos.titulo,
        descripcion: datos.descripcion || '',
        completada: datos.completada || false,
        creadaEn: new Date().toISOString()
    };
    tareas.push(nuevaTarea);
    return nuevaTarea;
}

// Actualizar tarea existente
function actualizar(id, datos) {
    const tarea = obtenerPorId(id);
    if (!tarea) return null;

    if (datos.titulo !== undefined) tarea.titulo = datos.titulo;
    if (datos.descripcion !== undefined) tarea.descripcion = datos.descripcion;
    if (datos.completada !== undefined) tarea.completada = datos.completada;
    
    return tarea;
}

// ✅ ELIMINAR tarea (lo que te pidieron)
function eliminar(id) {
    const index = tareas.findIndex(t => t.id === id);
    if (index === -1) return false; // No encontrada
    
    tareas.splice(index, 1);
    return true; // Eliminada exitosamente
}

// Exportar funciones
module.exports = {
    obtenerTodas,
    obtenerPorId,
    crear,
    actualizar,
    eliminar
};
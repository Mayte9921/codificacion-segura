// models/tareas.js
// Modelo de tareas - Gestiona el almacenamiento y operaciones CRUD

let tareas = [
  { id: 1, titulo: 'Revisar documentación de la API', completada: false },
  { id: 2, titulo: 'Configurar certificado HTTPS', completada: true }
];
let siguienteId = 3;

module.exports = {
  // Obtener todas las tareas
  obtenerTodas: () => tareas,
  
  // Obtener una tarea por su ID
  obtenerPorId: (id) => tareas.find(t => t.id === id),
  
  // Crear una nueva tarea
  crear: (titulo) => {
    const nueva = { 
      id: siguienteId++, 
      titulo, 
      completada: false 
    };
    tareas.push(nueva);
    return nueva;
  },
  
  // Actualizar una tarea existente
  actualizar: (id, datos) => {
    const tarea = tareas.find(t => t.id === id);
    if (!tarea) return null;
    // Actualizar solo los campos proporcionados
    Object.assign(tarea, datos);
    return tarea;
  },
  
  // Eliminar una tarea
  eliminar: (id) => {
    const indice = tareas.findIndex(t => t.id === id);
    if (indice === -1) return false;
    tareas.splice(indice, 1);
    return true;
  }
};
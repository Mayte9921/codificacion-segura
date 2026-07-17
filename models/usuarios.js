// models/usuarios.js
// Modelo de usuarios para la autenticación
// Almacena usuarios en memoria (para demostración)

let usuarios = [];
let siguienteId = 1;

module.exports = {
  // Buscar un usuario por su correo electrónico
  buscarPorCorreo: (correo) => usuarios.find(u => u.correo === correo),
  
  // Crear un nuevo usuario
  crear: (correo, hashPassword) => {
    const nuevo = { 
      id: siguienteId++, 
      correo, 
      password: hashPassword 
    };
    usuarios.push(nuevo);
    return nuevo;
  },
  
  // Obtener todos los usuarios (útil para depuración)
  obtenerTodos: () => usuarios
};
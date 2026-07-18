// models/usuarios.js
// Array en memoria para almacenar usuarios
let usuarios = [];
let siguienteId = 1;

module.exports = {
    /**
     * Buscar un usuario por su correo electrónico
     * @param {string} correo - Correo del usuario a buscar
     * @returns {Object|null} - Usuario encontrado o null
     */
    buscarPorCorreo: (correo) => {
        return usuarios.find(u => u.correo === correo);
    },

    /**
     * Buscar un usuario por su ID
     * @param {number} id - ID del usuario a buscar
     * @returns {Object|null} - Usuario encontrado o null
     */
    buscarPorId: (id) => {
        return usuarios.find(u => u.id === id);
    },

    /**
     * Crear un nuevo usuario
     * @param {string} correo - Correo del usuario
     * @param {string} hashPassword - Contraseña hasheada
     * @returns {Object} - Usuario creado (sin la contraseña)
     */
    crear: (correo, hashPassword) => {
        const nuevo = {
            id: siguienteId++,
            correo: correo,
            password: hashPassword,
            createdAt: new Date()
        };
        usuarios.push(nuevo);
        
        // Devolver el usuario sin la contraseña
        const { password, ...usuarioSinPassword } = nuevo;
        return usuarioSinPassword;
    }
};
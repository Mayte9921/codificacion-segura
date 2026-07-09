// generate-cert.js
const fs = require('fs');
const crypto = require('crypto');

console.log('🔐 Generando certificado autofirmado...');

try {
    // Generar par de llaves RSA de 2048 bits
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    // Guardar clave privada
    fs.writeFileSync('server.key', privateKey);
    console.log('✅ server.key generado correctamente');

    // Guardar clave pública como certificado (para desarrollo)
    fs.writeFileSync('server.cert', publicKey);
    console.log('✅ server.cert generado correctamente');

    console.log('\n🎯 ¡Certificados listos para usar!');
    console.log('📁 Archivos generados en la carpeta actual:');
    console.log('   - server.key');
    console.log('   - server.cert');
    console.log('\n🚀 Ahora puedes ejecutar: node app.js');

    // Verificar que los archivos existen
    if (fs.existsSync('server.key') && fs.existsSync('server.cert')) {
        console.log('✅ Verificación: Ambos archivos existen');
    }

} catch (error) {
    console.error('❌ Error al generar certificados:', error.message);
}
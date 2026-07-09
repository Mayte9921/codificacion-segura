// convert-pfx.js
const fs = require('fs');

console.log('🔐 Convirtiendo server.pfx a PEM...');

try {
    // Instalar node-forge si no está
    console.log('📦 Instalando node-forge...');
    require('child_process').execSync('npm install node-forge', { stdio: 'inherit' });
    
    const forge = require('node-forge');
    
    // Leer el archivo PFX (asegúrate de que esté en la carpeta correcta)
    const pfxBuffer = fs.readFileSync('./server.pfx');
    const pfx = forge.util.createBuffer(pfxBuffer.toString('binary'));
    
    // Extraer el certificado y la clave privada
    const p12Asn1 = forge.asn1.fromDer(pfx);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, 'temp'); // 'temp' es la contraseña que usaste
    
    // Obtener certificado y clave
    const keyBag = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag];
    const certBag = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];
    
    if (!keyBag || !certBag) {
        throw new Error('No se encontraron certificados en el archivo PFX');
    }
    
    // Convertir a PEM
    const privateKeyPem = forge.pki.privateKeyToPem(keyBag[0].key);
    const certPem = forge.pki.certificateToPem(certBag[0].cert);
    
    // Guardar archivos
    fs.writeFileSync('server.key', privateKeyPem);
    console.log('✅ server.key guardado');
    
    fs.writeFileSync('server.cert', certPem);
    console.log('✅ server.cert guardado');
    
    console.log('🎯 Certificados convertidos exitosamente');
    console.log('📁 Archivos generados: server.key, server.cert');
    
    // Verificar que los archivos existen
    if (fs.existsSync('server.key') && fs.existsSync('server.cert')) {
        console.log('✅ Verificación: Ambos archivos están presentes');
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Asegúrate de:');
    console.log('1. Tener el archivo server.pfx en la carpeta del proyecto');
    console.log('2. La contraseña sea "temp" (o cambia la contraseña en el código)');
    console.log('3. Ejecutar el comando: node convert-pfx.js');
}
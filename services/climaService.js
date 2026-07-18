// services/climaService.js
const axios = require('axios');

// ============================================
// CONFIGURACIÓN
// ============================================
const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5/weather';
const TIMEOUT = parseInt(process.env.CLIMA_TIMEOUT) || 5000;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

// ============================================
// CACHÉ
// ============================================
const cache = new Map();

// Limpiar caché cada hora
setInterval(() => {
    cache.clear();
    console.log('🧹 [ClimaService] Caché limpiado automáticamente');
}, 60 * 60 * 1000);

// ============================================
// HELPERS
// ============================================
function logInfo(mensaje) {
    console.log(`ℹ️ [ClimaService] ${mensaje}`);
}

function logError(mensaje, error = null) {
    console.error(`❌ [ClimaService] ${mensaje}`, error ? error.message : '');
}

function validarRespuestaClima(data) {
    if (!data || !data.name || !data.main || !data.weather || !data.weather[0]) {
        throw new Error('Respuesta del servicio de clima con estructura inválida');
    }
    return true;
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================
async function obtenerClima(ciudad, formato = 'completo') {
    // 1. Validar entrada
    if (!ciudad || ciudad.trim() === '') {
        const error = new Error('El nombre de la ciudad es obligatorio');
        error.codigo = 400;
        throw error;
    }

    const ciudadLimpia = ciudad.trim();
    const ciudadKey = ciudadLimpia.toLowerCase();

    // 2. Validar API Key
    if (!API_KEY) {
        logError('WEATHER_API_KEY no está definida en .env');
        const error = new Error('Error de configuración: API Key de clima no encontrada');
        error.codigo = 500;
        throw error;
    }

    // 3. Verificar caché
    if (cache.has(ciudadKey)) {
        const cached = cache.get(ciudadKey);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
            logInfo(`Usando caché para "${ciudadLimpia}"`);
            return cached.data;
        }
        cache.delete(ciudadKey);
    }

    try {
        logInfo(`Solicitando clima para: "${ciudadLimpia}"`);

        const response = await axios.get(BASE_URL, {
            params: {
                q: ciudadLimpia,
                appid: API_KEY,
                units: 'metric',
                lang: 'es'
            },
            timeout: TIMEOUT
        });

        // 4. Validar respuesta
        validarRespuestaClima(response.data);

        // 5. Procesar datos
        const datosClima = {
            ciudad: response.data.name,
            pais: response.data.sys.country,
            coordenadas: {
                lat: response.data.coord.lat,
                lon: response.data.coord.lon
            },
            temperatura: {
                actual: Math.round(response.data.main.temp),
                sensacion_termica: Math.round(response.data.main.feels_like),
                minima: Math.round(response.data.main.temp_min),
                maxima: Math.round(response.data.main.temp_max)
            },
            humedad: response.data.main.humidity,
            presion: response.data.main.pressure,
            viento: {
                velocidad: response.data.wind.speed,
                direccion: response.data.wind.deg || 0
            },
            descripcion: response.data.weather[0].description,
            icono: response.data.weather[0].icon,
            amanecer: new Date(response.data.sys.sunrise * 1000).toLocaleTimeString('es-ES'),
            atardecer: new Date(response.data.sys.sunset * 1000).toLocaleTimeString('es-ES')
        };

        // 6. Guardar en caché
        cache.set(ciudadKey, {
            data: datosClima,
            timestamp: Date.now()
        });

        logInfo(`✅ Clima obtenido para "${ciudadLimpia}": ${datosClima.temperatura.actual}°C`);

        // 7. Devolver según formato
        if (formato === 'simple') {
            return {
                ciudad: datosClima.ciudad,
                temperatura: datosClima.temperatura.actual,
                descripcion: datosClima.descripcion
            };
        }

        return datosClima;

    } catch (error) {
        logError(`Error al obtener clima para "${ciudadLimpia}"`, error);

        let mensajeError = 'Error al obtener datos del servicio de clima';
        let codigoError = 502;

        if (error.response) {
            const status = error.response.status;
            
            if (status === 404) {
                mensajeError = `Ciudad "${ciudadLimpia}" no encontrada en el servicio de clima`;
                codigoError = 404;
            } else if (status === 401) {
                mensajeError = 'Error de autenticación con el servicio de clima. Verifica tu API Key';
                codigoError = 502;
            } else if (status === 429) {
                mensajeError = 'Límite de peticiones al servicio de clima excedido. Intenta más tarde';
                codigoError = 502;
            } else {
                mensajeError = `El servicio de clima respondió con un error (${status})`;
                codigoError = 502;
            }
        } else if (error.request) {
            mensajeError = 'El servicio de clima no está disponible en este momento';
            codigoError = 502;
        } else {
            mensajeError = error.message || 'Error interno al preparar la solicitud del clima';
            codigoError = error.codigo || 500;
        }

        const errorPersonalizado = new Error(mensajeError);
        errorPersonalizado.codigo = codigoError;
        throw errorPersonalizado;
    }
}

// ============================================
// FUNCIÓN CON REINTENTOS
// ============================================
async function obtenerClimaConReintentos(ciudad, maxReintentos = 3) {
    let ultimoError = null;
    
    for (let intento = 1; intento <= maxReintentos; intento++) {
        try {
            logInfo(`Intento ${intento}/${maxReintentos} para "${ciudad}"`);
            return await obtenerClima(ciudad);
        } catch (error) {
            ultimoError = error;
            // Si es error 404 o 400, no reintentar
            if (error.codigo === 404 || error.codigo === 400) {
                throw error;
            }
            // Backoff exponencial
            if (intento < maxReintentos) {
                const espera = Math.min(Math.pow(2, intento) * 1000, 10000);
                logInfo(`Esperando ${espera}ms antes de reintentar...`);
                await new Promise(resolve => setTimeout(resolve, espera));
            }
        }
    }
    
    throw ultimoError;
}

module.exports = { 
    obtenerClima,
    obtenerClimaConReintentos,
    limpiarCache: () => cache.clear() // Para pruebas
};
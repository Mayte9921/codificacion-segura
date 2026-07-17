// services/climaService.js
const axios = require('axios');

class ClimaService {
    constructor() {
        this.apiKey = process.env.CLIMA_API_KEY;
        this.apiUrl = process.env.CLIMA_API_URL || 'http://api.openweathermap.org/data/2.5/weather';
    }

    async obtenerClima(ciudad) {
        try {
            const response = await axios.get(this.apiUrl, {
                params: {
                    q: ciudad,
                    appid: this.apiKey,
                    units: 'metric',
                    lang: 'es'
                }
            });

            return {
                ciudad: response.data.name,
                pais: response.data.sys.country,
                temperatura: response.data.main.temp,
                sensacion_termica: response.data.main.feels_like,
                humedad: response.data.main.humidity,
                descripcion: response.data.weather[0].description,
                icono: response.data.weather[0].icon
            };
        } catch (error) {
            if (error.response) {
                throw new Error(`Error en el servicio de clima: ${error.response.status} - ${error.response.data.message || 'Error desconocido'}`);
            } else if (error.request) {
                throw new Error('El servicio de clima no responde. Intente más tarde.');
            } else {
                throw new Error(`Error al obtener el clima: ${error.message}`);
            }
        }
    }
}

module.exports = new ClimaService();
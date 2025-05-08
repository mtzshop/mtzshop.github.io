// Configuración (REMPLAZA CON TUS DATOS)
const API_KEY = '$2a$10$QBpnVlqFPhaiynczLJl7fuotcF3IAww5INCQXiVp8H3k7jXZuwDy2';
const BIN_ID = '681586538561e97a500cb1e6';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// F
async function contarVisita() {
    // Verificar si ya contamos esta visita
    if (!localStorage.getItem('yaConte')) {
        try {
            // 1. Obtener contador actual
            const response = await fetch(JSONBIN_URL, {
                headers: { 'X-Master-Key': API_KEY }
            });
            const data = await response.json();
            let contador = data.record.visitas || 0;

            // 2. Sumar 1 al contador
            contador++;

            // 3. Actualizar JSONBin
            await fetch(JSONBIN_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': API_KEY
                },
                body: JSON.stringify({ visitas: contador })
            });

            // 4. Marcar como contado en localStorage (1 día de duración)
            localStorage.setItem('yaConte', 'true');
            
            console.log('✅ Visita contada!');
        } catch (error) {
            console.error('Error al actualizar:', error);
        }
    }
}

contarVisita();
// api/chat.js
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    if (!apiKey) {
        return res.status(500).json({ error: "API Key no encontrada" });
    }

    const { history } = req.body;

    // ==========================================
    // 1. LISTA DE TUS ARCHIVOS AQUÍ
    // ==========================================
    // Añade aquí todos los nombres de los archivos que subas a la carpeta 'api/'
    const misArchivos = [
        'acuerdocongrados.pdf','circular.pdf','instruccion.pdf'
    ];

    const SYSTEM_PROMPT = `
    Eres un asistente experto de STAZ.
    Tienes acceso a varios documentos PDF adjuntos.
    Responde a las preguntas del usuario consultando TODOS los documentos proporcionados.
    Si la información está en uno de ellos, úsala.
    `;

    try {
        // 2. PREPARAR EL MENSAJE CON MÚLTIPLES ARCHIVOS
        let parts = [];

        // Bucle: Leemos cada archivo de la lista y lo añadimos
        for (const fileName of misArchivos) {
            try {
                const filePath = path.join(process.cwd(), 'api', fileName);
                
                // Verificamos si el archivo existe antes de intentar leerlo
                if (fs.existsSync(filePath)) {
                    const fileBuffer = fs.readFileSync(filePath);
                    const base64Data = fileBuffer.toString('base64');

                    parts.push({
                        inline_data: {
                            mime_type: "application/pdf",
                            data: base64Data
                        }
                    });
                    console.log(`Archivo cargado: ${fileName}`);
                } else {
                    console.warn(`Advertencia: El archivo ${fileName} no se encuentra en el servidor.`);
                }
            } catch (err) {
                console.error(`Error leyendo ${fileName}:`, err);
            }
        }

        // 3. AÑADIMOS TEXTO E HISTORIAL
        parts.push({ text: SYSTEM_PROMPT });

        const lastUserMessage = history[history.length - 1].parts[0].text;
        parts.push({ text: "Pregunta del usuario: " + lastUserMessage });

        // 4. ENVIAR A GOOGLE
        const modelName = "gemini-2.0-flash"; 
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const payload = {
            contents: [
                {
                    role: "user",
                    parts: parts 
                }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Error Google:", JSON.stringify(data));
            return res.status(response.status).json(data);
        }

        res.status(200).json(data);

    } catch (error) {
        console.error("Error general:", error);
        res.status(500).json({ error: 'Error interno procesando archivos' });
    }
}
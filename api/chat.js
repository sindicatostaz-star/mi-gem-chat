
// api/chat.js
export default async function handler(req, res) {
    // 1. Verificaciones de seguridad básicas
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
    if (!apiKey) {
        return res.status(500).json({ error: "API Key no encontrada" });
    }

    const { history } = req.body;

    // 2. INSTRUCCIONES (Tu personalidad)
    const SYSTEM_MSG = "Eres un asistente virtual experto, muy amable, educado y profesional. Tu objetivo es ayudar al usuario con respuestas claras, precisas y en un tono formal pero cercano. Responde siempre en español.";

    // Truco: Insertamos la instrucción en el primer mensaje para asegurar compatibilidad
    let finalHistory = [...history];
    if (finalHistory.length > 0 && finalHistory[0].role === 'user') {
        finalHistory[0].parts[0].text = `${SYSTEM_MSG}\n\nUsuario: ${finalHistory[0].parts[0].text}`;
    }

    // 3. SELECCIÓN DEL MODELO (SACADO DE TU LISTA)
    // Usamos 'gemini-2.0-flash' que aparece explícitamente en tu JSON.
    const modelName = "gemini-2.0-flash"; 
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: finalHistory })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Error de Google:", JSON.stringify(data));
            return res.status(response.status).json(data);
        }

        res.status(200).json(data);

    } catch (error) {
        console.error("Error del servidor:", error);
        res.status(500).json({ error: 'Error interno de conexión' });
    }
}

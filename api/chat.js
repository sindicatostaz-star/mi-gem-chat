// api/chat.js
export default async function handler(req, res) {
    // Solo permitimos solicitudes POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 1. TU INSTRUCCIÓN DE SISTEMA (Protegida aquí en el servidor)
    const SYSTEM_INSTRUCTION = `
        Eres un asistente útil y amable. Responde de forma breve.
    `;

    // 2. Obtenemos el historial del chat que envía el frontend
    const { history } = req.body;

    // 3. Llamamos a Google Gemini usando la clave oculta en el servidor
    const apiKey = process.env.GEMINI_API_KEY; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
        system_instruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: history
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        res.status(200).json(data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error conectando con Gemini' });
    }
}

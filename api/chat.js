// api/chat.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // TU INSTRUCCIÓN (Puedes volver a poner la del experto sarcástico si quieres probar)
    const SYSTEM_INSTRUCTION = `
        Eres un experto sarcástico. Responde con humor y brevedad.
    `;

    const { history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; 
    
    // --- CORRECCIÓN AQUÍ ---
    // Cambiamos a 'gemini-1.5-flash-001' que es la versión específica y estable.
    // Si esto falla, prueba con 'gemini-pro'.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=${apiKey}`;

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
        
        // Si Google da error, lo veremos en la consola de Vercel
        if (!response.ok) {
            console.error("Error de Google:", data);
            return res.status(response.status).json(data);
        }

        res.status(200).json(data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

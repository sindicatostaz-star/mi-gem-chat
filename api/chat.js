// api/chat.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; 

    // 1. DEFINIMOS LA PERSONALIDAD
    const SYSTEM_INSTRUCTION = `
        INSTRUCCIONES DEL SISTEMA:
        Eres un experto asistente de IA, sarcástico y directo.
        Responde siempre con humor.
        --------------------------------
    `;

    // 2. TRUCO DE COMPATIBILIDAD:
    // Si es el primer mensaje, le pegamos las instrucciones al principio.
    // Esto evita el error "not supported" que te estaba saliendo.
    let finalHistory = [...history]; // Copiamos el historial
    
    if (finalHistory.length > 0 && finalHistory[0].role === 'user') {
        // Modificamos el primer mensaje del usuario para incluir las instrucciones ocultas
        const originalText = finalHistory[0].parts[0].text;
        finalHistory[0].parts[0].text = SYSTEM_INSTRUCTION + "\n\nUsuario dice: " + originalText;
    }

    // 3. MODELO ROBUSTO
    // Usamos 'gemini-1.5-flash'. Si este falla, puedes probar 'gemini-1.0-pro'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // 4. PAYLOAD SIMPLIFICADO (Sin el campo system_instruction que daba error)
    const payload = {
        contents: finalHistory
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            // Si falla, imprimimos el error en los logs de Vercel
            console.error("ERROR GOOGLE:", JSON.stringify(data, null, 2));
            return res.status(response.status).json(data);
        }

        res.status(200).json(data);

    } catch (error) {
        console.error("Error servidor:", error);
        res.status(500).json({ error: 'Error de conexión' });
    }
}

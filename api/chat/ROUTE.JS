// app/api/chat/route.js
import { NextResponse } from 'next/server';

// La chiave API di DeepSeek verrà presa dalle variabili d'ambiente
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Questa funzione gestisce le richieste POST all'URL /api/chat
export async function POST(request) {
  try {
    console.log("📍 Ricevuta richiesta all'endpoint /api/chat");
    
    // 1. Legge il corpo della richiesta (JSON) che contiene il "prompt"
    const { prompt, userId } = await request.json();
    console.log("📥 Prompt ricevuto:", prompt.substring(0, 100) + "..."); // Logga solo i primi 100 caratteri

    // 2. Controlla che il prompt sia stato fornito
    if (!prompt) {
      console.error("❌ Errore: Nessun prompt fornito");
      return NextResponse.json(
        { success: false, error: "Devi fornire un prompt per la richiesta." },
        { status: 400 } // Status code 400 = Bad Request
      );
    }

    // 3. Controlla che la API key sia configurata
    if (!DEEPSEEK_API_KEY) {
      console.error("❌ Errore: API Key di DeepSeek non configurata");
      return NextResponse.json(
        { success: false, error: "Configurazione del server incompleta." },
        { status: 500 } // Status code 500 = Internal Server Error
      );
    }

    // 4. Prepara la richiesta a DeepSeek
    console.log("🔗 Invio richiesta a DeepSeek...");
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'user', 
            content: prompt // Il testo completo della tua domanda
          }
        ],
        temperature: 0.1, // Bassa temperatura = risposte più focalizzate e meno creative
        max_tokens: 1000   // Lunghezza massima della risposta
      })
    });

    // 5. Controlla se la risposta di DeepSeek è ok
    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error("❌ Errore nella risposta di DeepSeek:", deepseekResponse.status, errorText);
      throw new Error(`Errore DeepSeek: ${deepseekResponse.status} ${deepseekResponse.statusText}`);
    }

    // 6. Estrae il testo della risposta dal JSON
    const data = await deepseekResponse.json();
    const botAnswer = data.choices[0].message.content;
    console.log("✅ Risposta ricevuta da DeepSeek:", botAnswer.substring(0, 100) + "...");

    // 7. Restituisce la risposta al frontend (il tuo bot)
    return NextResponse.json({ 
      success: true, 
      response: botAnswer 
    });

  } catch (error) {
    // 8. Gestisce qualsiasi errore imprevisto
    console.error('❌ Errore in /api/chat:', error.message);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Il vecchio saggio scout è momentaneamente assorto nei suoi ricordi... Prova a ripetere la domanda!",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 } // Status code 500 = Internal Server Error
    );
  }
}

// Spiegazione degli status HTTP:
// 200 = Success (Tutto ok)
// 400 = Bad Request (Dati inviati sbagliati)
// 500 = Internal Server Error (Errore nel server)
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// La tua API per il bot scout
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Nessun prompt fornito" });
    }

    // Chiamata a DeepSeek
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    const data = await deepseekResponse.json();
    res.json({ response: data.choices[0].message.content });

  } catch (error) {
    console.error('Errore:', error);
    res.status(500).json({ error: "Il vecchio saggio è momentaneamente assorto..." });
  }
});

// Pagina di benvenuto
app.get('/', (req, res) => {
  res.json({ message: "Server API Scout Bot è online! 🏕️" });
});

app.listen(PORT, () => {
  console.log(`Server scout running on port ${PORT}`);
});
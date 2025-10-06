
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';

const app = express();
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'","https://unpkg.com","https://cdn.jsdelivr.net","'unsafe-eval'"],
      "style-src": ["'self'","'unsafe-inline'","https://unpkg.com","https://fonts.googleapis.com"],
      "img-src": ["'self'","data:","https://flagcdn.com","https://*.wikipedia.org","https://upload.wikimedia.org"],
      "connect-src": ["'self'","https://cdn.jsdelivr.net","https://tile.openstreetmap.org","https://*.wikipedia.org","https://api.open-meteo.com","https://api.openai.com"],
      "font-src": ["'self'","https://fonts.gstatic.com"],
      "object-src": ["'none'"],
      "base-uri": ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));
app.use(compression());
app.use(express.json({limit:"1mb"}));

app.post('/api/ai-chat', async (req,res)=>{
  try{
    const { message, lang='es', currency='USD', date, nights, country, capital } = req.body||{};
    const key = process.env.OPENAI_API_KEY;
    if(!key) return res.status(500).json({error:"Missing OPENAI_API_KEY"});
    const system = `Eres un asistente de viajes conciso y práctico. Idioma: ${lang}. Si el usuario seleccionó un país (${country}), úsalo. Incluye tips de seguridad, mejor época, 2-3 platos típicos y costos aproximados en ${currency}. Si piden itinerario, genera uno. No inventes visados.`;
    let wiki='';
    try{
      if(country){
        const wlang = lang==='es'?'es':'en';
        const r = await fetch(`https://${wlang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(country)}`);
        if(r.ok){ const d = await r.json(); wiki = d.extract ? d.extract.slice(0, 600) : ''; }
      }
    }catch{}
    const payload = {
      model: "gpt-4o-mini",
      messages: [
        {role:"system", content: system},
        {role:"user", content: `Contexto: país=${country||'—'}; capital=${capital||'—'}; fecha=${date||'—'}; noches=${nights||'—'}; moneda=${currency}. Resumen externo: ${wiki}. Pregunta: ${message}`}
      ],
      temperature: 0.5,
      max_tokens: 500
    };
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method:"POST",
      headers: { "Content-Type":"application/json", "Authorization":`Bearer ${key}` },
      body: JSON.stringify(payload)
    });
    if(!resp.ok){
      const text = await resp.text();
      return res.status(500).json({error:"OpenAI error", detail:text});
    }
    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content || "Lo siento, no pude responder.";
    res.json({reply});
  }catch(e){
    res.status(500).json({error:"Function error", detail:String(e)});
  }
});

app.use(express.static('public', { extensions: ['html'] }));
app.get('*', (req,res)=>{
  res.sendFile(new URL('./public/index.html', import.meta.url).pathname);
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=> console.log('MapWorld PRO v3.1 running on :' + PORT));

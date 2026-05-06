export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Sorgu boş' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key bulunamadı' });

    const encoded = encodeURIComponent(query);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `Kullanıcı "${query}" ürününü arıyor. Aşağıdaki JSON formatında cevap ver. Sadece JSON yaz, başka hiçbir şey ekleme, markdown kullanma:
{"productName":"ürün adı","summary":"2 cümle açıklama","rating":4.3,"videos":[{"title":"video başlığı","channel":"kanal","views":"120K","rating":4.5,"good":true},{"title":"video 2","channel":"kanal2","views":"85K","rating":4.2,"good":true},{"title":"video 3","channel":"kanal3","views":"43K","rating":3.7,"good":false},{"title":"video 4","channel":"kanal4","views":"200K","rating":4.8,"good":true}],"prices":[{"store":"Trendyol","price":12999,"old":15999,"ship":"Ücretsiz","days":"1-2 gün","stock":true},{"store":"Hepsiburada","price":13499,"old":null,"ship":"Ücretsiz","days":"2-3 gün","stock":true},{"store":"Amazon","price":13299,"old":14499,"ship":"29₺","days":"1-2 gün","stock":true},{"store":"MediaMarkt","price":14199,"old":null,"ship":"Ücretsiz","days":"3-5 gün","stock":true},{"store":"Vatan","price":13899,"old":15499,"ship":"Ücretsiz","days":"2-4 gün","stock":false},{"store":"Teknosa","price":14499,"old":null,"ship":"49₺","days":"3-5 gün","stock":true}],"pros":["artı 1","artı 2","artı 3"],"cons":["eksi 1","eksi 2"],"verdict":"tavsiye 2 cümle Türkçe"}
Fiyatlar ürüne göre gerçekçi TL olsun. SADECE JSON.`
        }],
      }),
    });

    const aiData = await response.json();
    const text = aiData.content?.map(b => b.text || '').join('').trim();
    if (!text) return res.status(500).json({ error: 'AI boş yanıt döndürdü' });

    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(clean);

    // Gerçek arama linkleri ekle
    parsed.prices = parsed.prices.map(p => ({
      ...p,
      url: p.store === 'Trendyol' ? `https://www.trendyol.com/sr?q=${encoded}` :
           p.store === 'Hepsiburada' ? `https://www.hepsiburada.com/ara?q=${encoded}` :
           p.store === 'Amazon' ? `https://www.amazon.com.tr/s?k=${encoded}` :
           p.store === 'MediaMarkt' ? `https://www.mediamarkt.com.tr/tr/search.html?query=${encoded}` :
           p.store === 'Vatan' ? `https://www.vatanbilgisayar.com/arama/?q=${encoded}` :
           p.store === 'Teknosa' ? `https://www.teknosa.com/arama?q=${encoded}` :
           `https://www.google.com/search?q=${encoded}+${encodeURIComponent(p.store)}`
    }));

    // YouTube arama linkleri ekle
    parsed.videos = parsed.videos.map(v => ({
      ...v,
      url: `https://www.youtube.com/results?search_query=${encoded}+inceleme+${encodeURIComponent(v.channel)}`
    }));

    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Hata:', error.message);
    return res.status(500).json({ error: error.message });
  }
}


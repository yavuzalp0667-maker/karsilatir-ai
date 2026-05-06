export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Sorgu boş' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key bulunamadı' });

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
{"productName":"ürün adı","summary":"2 cümle açıklama","rating":4.3,"videos":[{"title":"video başlığı","channel":"kanal","views":"120K","rating":4.5,"good":true},{"title":"video 2","channel":"kanal2","views":"85K","rating":4.2,"good":true},{"title":"video 3","channel":"kanal3","views":"43K","rating":3.7,"good":false},{"title":"video 4","channel":"kanal4","views":"200K","rating":4.8,"good":true}],"prices":[{"store":"Trendyol","price":12999,"old":15999,"ship":"Ücretsiz","days":"1-2 gün","stock":true,"url":"https://www.trendyol.com/sr?q=urun"},{"store":"Hepsiburada","price":13499,"old":null,"ship":"Ücretsiz","days":"2-3 gün","stock":true,"url":"https://www.hepsiburada.com/ara?q=urun"},{"store":"Amazon","price":13299,"old":14499,"ship":"29₺","days":"1-2 gün","stock":true,"url":"https://www.amazon.com.tr/s?k=urun"},{"store":"MediaMarkt","price":14199,"old":null,"ship":"Ücretsiz","days":"3-5 gün","stock":true,"url":"https://www.mediamarkt.com.tr/tr/search.html?query=urun"},{"store":"Vatan","price":13899,"old":15499,"ship":"Ücretsiz","days":"2-4 gün","stock":false,"url":"https://www.vatanbilgisayar.com/arama/?q=urun"},{"store":"Teknosa","price":14499,"old":null,"ship":"49₺","days":"3-5 gün","stock":true,"url":"https://www.teknosa.com/arama?q=urun"}],"pros":["artı 1","artı 2","artı 3"],"cons":["eksi 1","eksi 2"],"verdict":"tavsiye 2 cümle Türkçe"}`
        }],
      }),
    });

    const aiData = await response.json();
    
    if (!aiData.content || aiData.content.length === 0) {
      console.error('Boş yanıt:', JSON.stringify(aiData));
      return res.status(500).json({ error: 'AI boş yanıt döndürdü', detail: JSON.stringify(aiData) });
    }

    const text = aiData.content.map(b => b.text || '').join('').trim();
    
    if (!text) {
      return res.status(500).json({ error: 'AI metni boş' });
    }

    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Hata:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

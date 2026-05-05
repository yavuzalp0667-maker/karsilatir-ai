export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Sorgu boş' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key yok' });

    const prompt = `Kullanıcı "${query}" ürününü arıyor. SADECE JSON döndür, başka hiçbir şey yazma:
{
  "productName": "temiz ürün adı",
  "summary": "2 cümle Türkçe açıklama",
  "rating": 4.3,
  "videos": [
    {"title":"YouTube inceleme başlığı","channel":"Kanal Adı","views":"120K","rating":4.5,"good":true},
    {"title":"inceleme 2","channel":"Kanal 2","views":"85K","rating":4.2,"good":true},
    {"title":"inceleme 3","channel":"Kanal 3","views":"43K","rating":3.7,"good":false},
    {"title":"inceleme 4","channel":"Kanal 4","views":"200K","rating":4.8,"good":true}
  ],
  "prices": [
    {"store":"Trendyol","price":12999,"old":15999,"ship":"Ücretsiz","days":"1-2 gün","stock":true,"url":"https://www.trendyol.com/sr?q=urun"},
    {"store":"Hepsiburada","price":13499,"old":null,"ship":"Ücretsiz","days":"2-3 gün","stock":true,"url":"https://www.hepsiburada.com/ara?q=urun"},
    {"store":"Amazon","price":13299,"old":14499,"ship":"29₺","days":"1-2 gün","stock":true,"url":"https://www.amazon.com.tr/s?k=urun"},
    {"store":"MediaMarkt","price":14199,"old":null,"ship":"Ücretsiz","days":"3-5 gün","stock":true,"url":"https://www.mediamarkt.com.tr/tr/search.html?query=urun"},
    {"store":"Vatan","price":13899,"old":15499,"ship":"Ücretsiz","days":"2-4 gün","stock":false,"url":"https://www.vatanbilgisayar.com/arama/?q=urun"},
    {"store":"Teknosa","price":14499,"old":null,"ship":"49₺","days":"3-5 gün","stock":true,"url":"https://www.teknosa.com/arama?q=urun"}
  ],
  "pros":["artı 1","artı 2","artı 3"],
  "cons":["eksi 1","eksi 2"],
  "verdict":"AI tavsiyesi 2 cümle Türkçe"
}
Fiyatlar ürüne göre gerçekçi TL olsun. SADECE JSON.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const aiData = await response.json();
    const text = aiData.content?.map(b => b.text || '').join('') || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Hata oluştu' });
  }
}

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
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Kullanıcı "${query}" ürününü arıyor.

Önce ürünün kategorisini belirle:
- elektronik: telefon, bilgisayar, kulaklık, tv, tablet, oyun konsolu, kamera vb.
- kozmetik: parfüm, makyaj, cilt bakım, saç bakım, deodorant vb.
- giyim: kıyafet, ayakkabı, çanta, aksesuar, saat vb.
- ev: mobilya, mutfak, dekorasyon, beyaz eşya, aydınlatma vb.
- spor: spor malzemesi, fitness, outdoor, bisiklet vb.
- oyun: video oyun, oyun ekipmanı vb.
- kitap: kitap, dergi vb.
- genel: diğer her şey

Kategoriye göre uygun mağazaları seç:
- elektronik: Trendyol, Hepsiburada, Amazon, MediaMarkt, Vatan, Teknosa
- kozmetik: Trendyol, Hepsiburada, Amazon, Sephora, Gratis, Flormar
- giyim: Trendyol, Hepsiburada, Amazon, LCWaikiki, Zara, Mango
- ev: Trendyol, Hepsiburada, Amazon, IKEA, Koçtaş, Karaca
- spor: Trendyol, Hepsiburada, Amazon, Decathlon, Nike, Adidas
- oyun: Trendyol, Hepsiburada, Amazon, GameGaraj, itopya, PlayStation
- kitap: Trendyol, Hepsiburada, Amazon, Kitapyurdu, DR, İdefix
- genel: Trendyol, Hepsiburada, Amazon, N11, GittiGidiyor, ePttAVM

Fiyatları o ürüne gerçekçi TL değerlerinde yaz.

SADECE JSON döndür, başka hiçbir şey yazma:
{
  "productName": "ürün adı",
  "category": "kategori",
  "summary": "2 cümle Türkçe açıklama",
  "rating": 4.3,
  "videos": [
    {"title":"YouTube inceleme başlığı","channel":"Kanal Adı","views":"120K","rating":4.5,"good":true},
    {"title":"inceleme 2","channel":"Kanal 2","views":"85K","rating":4.2,"good":true},
    {"title":"inceleme 3","channel":"Kanal 3","views":"43K","rating":3.7,"good":false},
    {"title":"inceleme 4","channel":"Kanal 4","views":"200K","rating":4.8,"good":true}
  ],
  "prices": [
    {"store":"Mağaza1","price":1299,"old":1599,"ship":"Ücretsiz","days":"1-2 gün","stock":true},
    {"store":"Mağaza2","price":1349,"old":null,"ship":"Ücretsiz","days":"2-3 gün","stock":true},
    {"store":"Mağaza3","price":1329,"old":1449,"ship":"29₺","days":"1-2 gün","stock":true},
    {"store":"Mağaza4","price":1419,"old":null,"ship":"Ücretsiz","days":"3-5 gün","stock":true},
    {"store":"Mağaza5","price":1389,"old":1549,"ship":"Ücretsiz","days":"2-4 gün","stock":false},
    {"store":"Mağaza6","price":1449,"old":null,"ship":"49₺","days":"3-5 gün","stock":true}
  ],
  "pros": ["artı 1", "artı 2", "artı 3"],
  "cons": ["eksi 1", "eksi 2"],
  "verdict": "AI tavsiyesi 2 cümle Türkçe"
}`
        }],
      }),
    });

    const aiData = await response.json();
    const text = aiData.content?.map(b => b.text || '').join('').trim();
    if (!text) return res.status(500).json({ error: 'AI boş yanıt döndürdü' });

    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(clean);

    const storeUrls = {
      'Trendyol': `https://www.trendyol.com/sr?q=${encoded}`,
      'Hepsiburada': `https://www.hepsiburada.com/ara?q=${encoded}`,
      'Amazon': `https://www.amazon.com.tr/s?k=${encoded}`,
      'MediaMarkt': `https://www.mediamarkt.com.tr/tr/search.html?query=${encoded}`,
      'Vatan': `https://www.vatanbilgisayar.com/arama/?q=${encoded}`,
      'Teknosa': `https://www.teknosa.com/arama?q=${encoded}`,
      'Sephora': `https://www.sephora.com.tr/search?q=${encoded}`,
      'Gratis': `https://www.gratis.com/arama?q=${encoded}`,
      'Flormar': `https://www.flormar.com.tr/arama?q=${encoded}`,
      'LCWaikiki': `https://www.lcwaikiki.com/tr-TR/search?q=${encoded}`,
      'Zara': `https://www.zara.com/tr/tr/search?searchTerm=${encoded}`,
      'Mango': `https://shop.mango.com/tr/search?q=${encoded}`,
      'IKEA': `https://www.ikea.com/tr/tr/search/?q=${encoded}`,
      'Koçtaş': `https://www.koctas.com.tr/arama?q=${encoded}`,
      'Karaca': `https://www.karaca.com/tr/arama?q=${encoded}`,
      'Decathlon': `https://www.decathlon.com.tr/search?Ntt=${encoded}`,
      'Nike': `https://www.nike.com/tr/search?q=${encoded}`,
      'Adidas': `https://www.adidas.com.tr/search?q=${encoded}`,
      'GameGaraj': `https://www.gamegaraj.com/search?q=${encoded}`,
      'itopya': `https://www.itopya.com/ara?q=${encoded}`,
      'PlayStation': `https://store.playstation.com/tr-tr/search/${encoded}`,
      'Kitapyurdu': `https://www.kitapyurdu.com/index.php?route=product/search&filter_name=${encoded}`,
      'DR': `https://www.dr.com.tr/search?q=${encoded}`,
      'İdefix': `https://www.idefix.com/search?q=${encoded}`,
      'N11': `https://www.n11.com/arama?q=${encoded}`,
      'GittiGidiyor': `https://www.gittigidiyor.com/arama?k=${encoded}`,
      'ePttAVM': `https://www.epttavm.com/arama?q=${encoded}`,
    };

    parsed.prices = parsed.prices.map(p => ({
      ...p,
      url: storeUrls[p.store] || `https://www.google.com/search?q=${encoded}+${encodeURIComponent(p.store)}`
    }));

    parsed.videos = parsed.videos.map(v => ({
      ...v,
      url: `https://www.youtube.com/results?search_query=${encoded}+inceleme`
    }));

    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Hata:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

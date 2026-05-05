import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { query } = await request.json()

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Sorgu boş olamaz' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key bulunamadı' }, { status: 500 })
    }

    const prompt = `Kullanıcı "${query}" ürününü arıyor. SADECE aşağıdaki JSON formatında cevap ver, başka hiçbir şey yazma:

{
  "productName": "temiz ürün adı",
  "summary": "Ürün hakkında 2 cümle Türkçe açıklama",
  "rating": 4.3,
  "videos": [
    {"title": "gerçekçi YouTube inceleme başlığı", "channel": "Kanal Adı", "views": "120K", "rating": 4.5, "good": true},
    {"title": "inceleme 2", "channel": "Kanal 2", "views": "85K", "rating": 4.2, "good": true},
    {"title": "inceleme 3", "channel": "Kanal 3", "views": "43K", "rating": 3.7, "good": false},
    {"title": "inceleme 4", "channel": "Kanal 4", "views": "200K", "rating": 4.8, "good": true}
  ],
  "prices": [
    {"store": "Trendyol", "price": 12999, "old": 15999, "ship": "Ücretsiz", "days": "1-2 gün", "stock": true, "url": "https://www.trendyol.com/sr?q=${encodeURIComponent(query)}"},
    {"store": "Hepsiburada", "price": 13499, "old": null, "ship": "Ücretsiz", "days": "2-3 gün", "stock": true, "url": "https://www.hepsiburada.com/ara?q=${encodeURIComponent(query)}"},
    {"store": "Amazon", "price": 13299, "old": 14499, "ship": "29₺", "days": "1-2 gün", "stock": true, "url": "https://www.amazon.com.tr/s?k=${encodeURIComponent(query)}"},
    {"store": "MediaMarkt", "price": 14199, "old": null, "ship": "Ücretsiz", "days": "3-5 gün", "stock": true, "url": "https://www.mediamarkt.com.tr/tr/search.html?query=${encodeURIComponent(query)}"},
    {"store": "Vatan", "price": 13899, "old": 15499, "ship": "Ücretsiz", "days": "2-4 gün", "stock": false, "url": "https://www.vatanbilgisayar.com/arama/?q=${encodeURIComponent(query)}"},
    {"store": "Teknosa", "price": 14499, "old": null, "ship": "49₺", "days": "3-5 gün", "stock": true, "url": "https://www.teknosa.com/arama?q=${encodeURIComponent(query)}"}
  ],
  "pros": ["artı özellik 1", "artı özellik 2", "artı özellik 3"],
  "cons": ["eksi özellik 1", "eksi özellik 2"],
  "verdict": "AI değerlendirmesi: hangi mağazadan alınmalı ve genel tavsiye (2 cümle Türkçe)"
}

Kurallar:
- Fiyatlar gerçekçi Türk Lirası değerleri olsun (ürüne göre mantıklı)
- Mağaza URL'leri arama sayfasına yönlendirsin
- SADECE JSON döndür, markdown veya açıklama ekleme`

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
    })

    if (!response.ok) {
      throw new Error('Anthropic API hatası')
    }

    const aiData = await response.json()
    const text = aiData.content?.map(b => b.text || '').join('') || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)

  } catch (error) {
    console.error('Search API Error:', error)
    return NextResponse.json({ error: 'Arama sırasında hata oluştu' }, { status: 500 })
  }
}

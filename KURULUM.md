# KarşılaştırAI — Kurulum Rehberi

## 📋 Adım Adım Kurulum (Kod bilmeden yapılır!)

---

## 1. ADIM — GitHub'a Yükle

1. github.com'a git ve giriş yap
2. Sağ üstteki **"+"** butonuna tıkla → **"New repository"**
3. Repository adı: `karsilastir-ai`
4. **"Public"** seç
5. **"Create repository"** tıkla
6. Açılan sayfada **"uploading an existing file"** linkine tıkla
7. Bu klasördeki TÜM dosyaları sürükle-bırak et
8. **"Commit changes"** tıkla

---

## 2. ADIM — Vercel'e Deploy Et

1. vercel.com'a git ve **GitHub ile giriş** yap
2. **"Add New Project"** tıkla
3. `karsilastir-ai` reposunu seç → **"Import"**
4. **"Environment Variables"** bölümüne gel:
   - Key: `ANTHROPIC_API_KEY`
   - Value: (Anthropic'ten aldığın API key'i yapıştır)
5. **"Deploy"** tıkla
6. 2 dakika bekle → Siteniz yayında! 🎉

---

## 3. ADIM — API Key Al (Ücretsiz)

1. console.anthropic.com'a git
2. Kayıt ol (e-posta ile)
3. Sol menü → **"API Keys"**
4. **"Create Key"** → Kodu kopyala
5. Bu kodu Vercel'deki Environment Variables'a yapıştır

---

## 4. ADIM — Domain Bağla (İsteğe bağlı)

Vercel Dashboard → Settings → Domains → İstediğin domain'i ekle

Ücretsiz alternatif: `karsilastir-ai.vercel.app` olarak kullan

---

## 💰 Para Kazanma

### Affiliate Programları (Ücretsiz başvur, komisyon kazan)

| Platform | Başvuru Linki | Komisyon |
|----------|---------------|----------|
| Trendyol Affiliate | affiliate.trendyol.com | %2-5 |
| Amazon Associates | affiliate-program.amazon.com.tr | %2-8 |
| Hepsiburada Partner | partner.hepsiburada.com | %1-4 |

Onaylanınca API key alırsın, `route.js` dosyasındaki URL'leri affiliate linklere çevirirsin.

### Reklam Gelirleri

- **Google AdSense**: adsense.google.com — 1000 ziyaretçi/ay olunca başvur
- **Doğrudan Reklam**: Sitedeki "Reklam Ver" butonu zaten var, markalara e-posta at

---

## 📞 Sorun mu var?

Site çalışmıyorsa kontrol et:
1. ANTHROPIC_API_KEY doğru mu?
2. Vercel deployment başarılı mı? (kırmızı hata var mı?)
3. .env.local dosyasında API key yazılı mı?

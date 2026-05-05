export const metadata = {
  title: 'KarşılaştırAI — Ürün İncele & En Ucuzu Bul',
  description: 'Türkiye\'nin yapay zeka destekli ürün karşılaştırma platformu. İnceleme videolarını izle, en uygun fiyatı bul.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body style={{margin:0, padding:0}}>{children}</body>
    </html>
  )
}

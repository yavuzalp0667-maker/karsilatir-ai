'use client'
import { useState } from 'react'
import styles from './page.module.css'

const TRENDING = [
  "iPhone 16 Pro", "Sony WH-1000XM5", "Samsung Galaxy S25",
  "AirFryer", "PlayStation 5", "Dyson V15"
]

const STORE_EMOJI = {
  Trendyol:"🛍️", Hepsiburada:"🧡", Amazon:"📦",
  N11:"🔵", MediaMarkt:"🔴", Vatan:"🟠", Teknosa:"🟣"
}

export default function Home() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('idle')
  const [data, setData] = useState(null)
  const [adModal, setAdModal] = useState(false)

  async function search(term) {
    const query = term || q
    if (!query.trim()) return
    setQ(query)
    setStatus('loading')
    setData(null)

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      const result = await res.json()
      if (result.error) throw new Error(result.error)
      result.prices.sort((a, b) => a.price - b.price)
      setData(result)
      setStatus('done')
    } catch (e) {
      setStatus('error')
    }
  }

  return (
    <main className={styles.main}>

      {/* NAV */}
      <nav className={styles.nav}>
        <span className={styles.logo}>KarşılaştırAI</span>
        <button onClick={() => setAdModal(true)} className={styles.adNavBtn}>💰 Reklam Ver</button>
      </nav>

      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.heroTag}>🤖 Yapay Zeka Destekli Ürün Araştırma</div>
        <h1 className={styles.h1}>
          Her Ürünü <span className={styles.grad1}>Araştır</span>,<br/>
          En Ucuzunu <span className={styles.grad2}>Bul</span>.
        </h1>
        <p className={styles.heroSub}>İnceleme videoları • Fiyat karşılaştırması • AI analizi</p>

        <div className={styles.searchBox}>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Ürün ara... örn: iPhone 16 Pro, AirFryer, PS5"
            className={styles.searchInput}
          />
          <button onClick={() => search()} disabled={status === 'loading'} className={styles.searchBtn}>
            {status === 'loading' ? '⏳' : '🔍 Ara'}
          </button>
        </div>

        <div className={styles.tags}>
          {TRENDING.map(t => (
            <button key={t} onClick={() => search(t)} className={styles.tag}>{t}</button>
          ))}
        </div>
      </div>

      {/* TOP AD BANNER */}
      <div className={styles.adBanner}>
        <span className={styles.adLabel}>Reklam</span>
        <span className={styles.adText}><strong>Markanızı Burada Görün!</strong> — Günlük binlerce alıcıya ulaşın.</span>
        <button onClick={() => setAdModal(true)} className={styles.adBtn}>Teklif Al →</button>
      </div>

      {/* CONTENT */}
      <div className={styles.content}>

        {status === 'loading' && (
          <div className={styles.center}>
            <div className={styles.spinner}></div>
            <p style={{color:'#666', marginTop:16}}>🤖 AI analiz yapıyor...</p>
            <div className={styles.loadingSteps}>
              {['📹 Videolar taranıyor','💰 Fiyatlar karşılaştırılıyor','🧠 AI değerlendiriyor'].map(x => (
                <span key={x} style={{color:'#444', fontSize:'0.8rem'}}>{x}</span>
              ))}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.center}>
            <div style={{fontSize:'3rem', marginBottom:12}}>⚠️</div>
            <p style={{color:'#ef4444'}}>Bir hata oluştu. Lütfen tekrar deneyin.</p>
          </div>
        )}

        {status === 'idle' && (
          <div className={styles.center}>
            <div style={{fontSize:'3.5rem', opacity:0.2, marginBottom:14}}>🔎</div>
            <p style={{color:'#444', fontSize:'1rem', fontWeight:600}}>Aramak istediğin ürünü yaz</p>
            <p style={{color:'#333', fontSize:'0.85rem', marginTop:6}}>İnceleme videoları ve fiyat karşılaştırması anında gelecek</p>
          </div>
        )}

        {status === 'done' && data && (
          <div className={styles.results}>

            {/* SUMMARY */}
            <div className={styles.summaryCard}>
              <h2 className={styles.productName}>🔍 {data.productName}</h2>
              <p className={styles.productSummary}>{data.summary}</p>
              <div className={styles.stats}>
                {[
                  {v:`${data.rating} ⭐`, l:'Genel Puan'},
                  {v:`${data.videos.length} 📹`, l:'İnceleme'},
                  {v:`${data.prices.length} 🏪`, l:'Mağaza'},
                  {v:`₺${data.prices[0].price.toLocaleString('tr-TR')}`, l:'💚 En Ucuz'},
                ].map(x => (
                  <div key={x.l} className={styles.stat}>
                    <div className={styles.statVal}>{x.v}</div>
                    <div className={styles.statLabel}>{x.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* VIDEOS */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}><span className={styles.iconRed}>▶</span> İnceleme Videoları</h3>
                <span className={styles.badge}>{data.videos.length} video</span>
              </div>
              <div className={styles.videoGrid}>
                {data.videos.map((v, i) => (
                  <div key={i} className={styles.videoCard}>
                    <div className={styles.videoThumb}>
                      🎥
                      <div className={styles.playOverlay}>
                        <div className={styles.playBtn}>▶</div>
                      </div>
                    </div>
                    <div className={styles.videoInfo}>
                      <span className={styles.platform}>▶ YouTube</span>
                      <div className={styles.videoTitle}>{v.title}</div>
                      <div className={styles.videoMeta}>📺 {v.channel} · 👁 {v.views} · ⭐ {v.rating}</div>
                      <span className={styles[v.good ? 'sentGood' : 'sentNeutral']}>
                        {v.good ? '👍 Olumlu' : '🤔 Karma'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PRICES */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}><span className={styles.iconGreen}>💰</span> Fiyat Karşılaştırması</h3>
                <span className={styles.badge}>{data.prices.length} mağaza</span>
              </div>
              <div className={styles.priceList}>
                {data.prices.map((p, i) => {
                  const disc = p.old ? Math.round((1 - p.price/p.old)*100) : 0
                  return (
                    <div key={i} className={`${styles.priceCard} ${i===0 ? styles.bestPrice : ''}`}>
                      {i===0 && <div className={styles.bestBadge}>✓ En Uygun Fiyat</div>}
                      <div className={`${styles.rank} ${styles['rank'+Math.min(i,3)]}`}>{i+1}</div>
                      <div className={styles.storeLogo}>{STORE_EMOJI[p.store]||'🏪'}</div>
                      <div className={styles.storeInfo}>
                        <div className={styles.storeName}>{p.store}</div>
                        <div className={styles.storeMeta}>
                          <span style={{color: p.ship==='Ücretsiz'?'#10b981':'#777'}}>{p.ship==='Ücretsiz'?'✓ Ücretsiz':'📦 '+p.ship}</span>
                          <span>⚡ {p.days}</span>
                          <span style={{color: p.stock?'#10b981':'#ef4444'}}>{p.stock?'● Stokta':'● Stokta Yok'}</span>
                        </div>
                      </div>
                      <div className={styles.priceWrap}>
                        {p.old && <div className={styles.oldPrice}>₺{p.old.toLocaleString('tr-TR')}</div>}
                        <div className={`${styles.price} ${i===0?styles.bestPriceText:''}`}>₺{p.price.toLocaleString('tr-TR')}</div>
                        {disc>0 && <span className={styles.disc}>-%{disc}</span>}
                      </div>
                      <a href={p.url || '#'} target="_blank" rel="noopener noreferrer" className={styles.buyBtn}>Satın Al</a>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* AI VERDICT */}
            <div className={styles.aiCard}>
              <div className={styles.aiHeader}>
                <div className={styles.aiIcon}>🤖</div>
                <div>
                  <div className={styles.aiTitle}>AI Uzman Değerlendirmesi</div>
                  <div className={styles.aiSub}>KarşılaştırAI tarafından analiz edildi</div>
                </div>
              </div>
              <p className={styles.aiText}>{data.verdict}</p>
              <div className={styles.proscons}>
                <div className={styles.pros}>
                  <div className={styles.prosTitle}>👍 Artıları</div>
                  {data.pros.map((x,i) => <div key={i} className={styles.prosItem}>✓ {x}</div>)}
                </div>
                <div className={styles.cons}>
                  <div className={styles.consTitle}>👎 Eksileri</div>
                  {data.cons.map((x,i) => <div key={i} className={styles.consItem}>✗ {x}</div>)}
                </div>
              </div>
            </div>

            {/* BOTTOM ADS */}
            <div className={styles.adGrid}>
              {[
                {icon:'🛒', t:'E-Ticaret Reklamı', d:'300×250 banner alanı · 5.000+ görüntülenme/gün'},
                {icon:'📣', t:'Marka Tanıtımı', d:'Native içerik alanı · Hedeflenmiş alıcı kitlesi'},
              ].map(a => (
                <div key={a.t} onClick={() => setAdModal(true)} className={styles.adUnit}>
                  <div className={styles.adUnitLabel}>Reklam</div>
                  <div style={{fontSize:'1.8rem', marginBottom:8}}>{a.icon}</div>
                  <div className={styles.adUnitTitle}>{a.t}</div>
                  <div className={styles.adUnitDesc}>{a.d}</div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className={styles.footer}>
        © 2026 <strong>KarşılaştırAI</strong> · Türkiye'nin Ürün Karşılaştırma Platformu ·{' '}
        <span onClick={() => setAdModal(true)} style={{cursor:'pointer'}}>Reklam Ver</span>
      </footer>

      {/* AD MODAL */}
      {adModal && (
        <div className={styles.modalOverlay} onClick={() => setAdModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button onClick={() => setAdModal(false)} className={styles.modalClose}>×</button>
            <div style={{fontSize:'2.2rem', marginBottom:12}}>💰</div>
            <h2 className={styles.modalTitle}>Reklam Paketleri</h2>
            <p className={styles.modalSub}>Aktif alışveriş yapan binlerce kullanıcıya ulaşın.</p>
            {[
              {p:'Başlangıç', d:'Banner + Sponsorlu liste', f:'₺999/ay', hi:false},
              {p:'Pro ⭐', d:'Öncelikli gösterim + Analytics', f:'₺2.499/ay', hi:true},
              {p:'Kurumsal', d:'Tam sayfa + Native içerik', f:'₺5.999/ay', hi:false},
            ].map(x => (
              <div key={x.p} className={`${styles.planCard} ${x.hi ? styles.planHi : ''}`}>
                <div>
                  <div className={styles.planName}>{x.p}</div>
                  <div className={styles.planDesc}>{x.d}</div>
                </div>
                <div className={`${styles.planPrice} ${x.hi ? styles.planPriceHi : ''}`}>{x.f}</div>
              </div>
            ))}
            <button onClick={() => window.location.href='mailto:reklam@karsilastir.ai'} className={styles.contactBtn}>
              İletişime Geç →
            </button>
          </div>
        </div>
      )}

    </main>
  )
}

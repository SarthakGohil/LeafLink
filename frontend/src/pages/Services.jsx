import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, API } from '../context/AuthContext'

const SERVICES = [
  { title: 'Remote Sensing Service',    body: 'Accuracy requirements, management unit size, expected users of data, existing information like remote sensing data, available funding, equipment and infrastructure — we handle the full chain from data collection to visualisation.' },
  { title: 'Smart Forestry Product',    body: 'LeafLink Smart Forestry uses innovative software, state-of-the-art forestry technology, and modern techniques to improve forest management operations, providing reliable information by mapping, optimising and monitoring the forest supply chain.' },
  { title: 'Forest Modeling Service',   body: 'Accurate growth and development modelling is the starting point for sustainable forest management planning. Our services cover the whole chain, from inventory analysis to long-term asset development scenarios and optimised tactical management plans.' },
  { title: 'Forest Valuation Service',  body: 'We offer forest valuations combining state-of-the-art modelling tools, comprehensive market data and automated routines to provide cost-efficient and accurate valuations. Compatible with IFRS and GAAP standards.' },
  { title: 'Forest Carbon Service',     body: 'Reporting climate impacts is a prerequisite for transparent communication. Modelling and analysing the carbon impacts of changing forest management is a vital decision-making tool — our services do exactly this.' },
  { title: 'Bioindustry Management',    body: 'The world is changing fast. Megatrends such as sustainability, climate change, urbanisation and digitalisation bring both challenges and opportunities to pulp, paper and packaging industries. We help you adapt.' },
]

const PRODUCTS = [
  { name: 'Tree Planting Kits',           stars: 5, price: '$30-$50 per kit',     desc: 'Complete kits for planting trees including saplings, soil, fertilizers and instructions.' },
  { name: 'Forestry Tools',               stars: 4, price: '$25-$600',             desc: 'Pruning shears, chainsaws and hand tools for all forestry needs.' },
  { name: 'Tree Seedlings',               stars: 4, price: '$5-$15 per seedling',  desc: 'Hardwoods and evergreens suitable for reforestation or personal gardens.' },
  { name: 'Forest Management Software',   stars: 4, price: '$500-$2,000',          desc: 'Advanced software for tracking forest resources, mapping and growth forecasting.' },
  { name: 'Soil Testing Kits',            stars: 5, price: '$40-$80',              desc: 'Analyse pH, nutrient content and moisture — essential for optimal planting.' },
  { name: 'Wildlife Monitoring Cameras',  stars: 4, price: '$150-$400',            desc: 'Motion-activated cameras for research, conservation and wildlife protection.' },
]

/**
 * Services — STATEFUL page component
 * Manages: expandedIndex (accordion), likedProducts (favorites state).
 * Like button calls POST /api/profile/favorites/toggle (JWT required).
 */
export default function Services() {
  const [expanded, setExpanded] = useState(null)
  const [likeLoading, setLikeLoading] = useState(null)    // which product is toggling
  const [toastMsg, setToastMsg] = useState('')

  const { user, token, updateUser } = useAuth()
  const navigate = useNavigate()

  // Sync favorites from user context
  const userFavs = user?.favorites || []

  const toggle = (i) => setExpanded(prev => prev === i ? null : i)

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  /* Toggle like on a product */
  const handleLike = async (productName) => {
    if (!user) {
      showToast('🔐 Please login to save favourites.')
      setTimeout(() => navigate('/login'), 1500)
      return
    }
    setLikeLoading(productName)
    try {
      const res  = await fetch(`${API}/profile/favorites/toggle`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ product: productName }),
      })
      const data = await res.json()
      if (res.ok) {
        updateUser({ favorites: data.favorites })        // update global auth context
        showToast(data.action === 'added' ? `❤️ Added to favourites!` : `💔 Removed from favourites.`)
      }
    } catch { showToast('Could not update. Try again.') }
    setLikeLoading(null)
  }

  return (
    <main>
      {/* Toast notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          background: '#1a4144', color: '#f5f1ce', padding: '12px 28px', borderRadius: 30,
          fontWeight: 700, fontSize: 15, boxShadow: '0 8px 30px rgba(0,0,0,.25)', zIndex: 9999,
          animation: 'fadeIn .3s',
        }}>
          {toastMsg}
        </div>
      )}

      {/* Hero */}
      <div style={{
        background: 'url(https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1400) center/cover',
        padding: '80px 0', textAlign: 'center',
      }}>
        <h1 style={{ color: '#f5f1ce', fontWeight: 800, textShadow: '0 2px 8px rgba(0,0,0,.6)' }}>
          Services &amp; Products
        </h1>
        <p style={{ color: '#f5f1ce', fontSize: '1.1rem', maxWidth: 600, margin: '12px auto 0' }}>
          Leveraging cutting-edge technology for comprehensive forest management solutions.
        </p>
      </div>

      {/* Accordion Services */}
      <section className="py-5">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          {SERVICES.map((s, i) => (
            <div className="service-accordion" key={s.title}>
              <div className="acc-header" onClick={() => toggle(i)}>
                {s.title}
                <span>{expanded === i ? '▲' : '▼'}</span>
              </div>
              <div className={`acc-body ${expanded === i ? 'open' : ''}`}>
                <p style={{ margin: 0 }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products grid with like button */}
      <section className="py-5" style={{ background: '#f0ede0' }}>
        <div className="container">
          <h2 className="section-title">Our Products</h2>
          {!user && (
            <p style={{ textAlign: 'center', color: '#888', fontSize: 14, marginBottom: 24 }}>
              <a href="/login" style={{ color: '#5cba7d', fontWeight: 700 }}>Login</a> to save favourites ❤️
            </p>
          )}
          <div className="row g-4">
            {PRODUCTS.map(p => {
              const isLiked   = userFavs.includes(p.name)
              const isLoading = likeLoading === p.name
              return (
                <div className="col-md-4" key={p.name}>
                  <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: 12, borderTop: '4px solid #5cba7d', position: 'relative', transition: 'transform .2s', cursor: 'default' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    {/* Like button */}
                    <button
                      onClick={() => handleLike(p.name)}
                      disabled={isLoading}
                      title={isLiked ? 'Remove from favourites' : 'Add to favourites'}
                      style={{
                        position: 'absolute', top: 12, right: 12,
                        background: isLiked ? '#ffe6ec' : '#f0ede0',
                        border: `2px solid ${isLiked ? '#e74c3c' : '#ccc'}`,
                        borderRadius: '50%', width: 38, height: 38,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontSize: 18,
                        transition: 'all .2s', boxShadow: '0 2px 8px rgba(0,0,0,.1)',
                        transform: isLiked ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      {isLoading ? '⏳' : isLiked ? '❤️' : '🤍'}
                    </button>

                    <div className="card-body" style={{ paddingTop: 20 }}>
                      <h5 className="card-title" style={{ color: '#1a4144', paddingRight: 40 }}>{p.name}</h5>
                      <p style={{ color: '#5cba7d', fontSize: 14, margin: '4px 0' }}>
                        {'★'.repeat(p.stars)}{'☆'.repeat(5 - p.stars)}
                      </p>
                      <p className="card-text" style={{ fontSize: 14, color: '#555' }}>{p.desc}</p>
                      <p style={{ fontWeight: 800, color: '#1a4144', marginBottom: 0 }}>{p.price}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}

import { useState } from 'react'

const IMAGES = [
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600',
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600',
  'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=600',
  'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=600',
  'https://images.unsplash.com/photo-1511497584788-876760111969?w=600',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600',
  'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600',
  'https://images.unsplash.com/photo-1500622944204-b135684e99fd?w=600',
  'https://images.unsplash.com/photo-1566792763-2a50a4b7f73d?w=600',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600',
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600',
]

/**
 * Gallery — STATEFUL page component
 * Manages: selectedImg (lightbox open state).
 * null = lightbox closed, string URL = lightbox open.
 */
export default function Gallery() {
  const [selectedImg, setSelectedImg] = useState(null)

  return (
    <main>
      <div style={{ background: '#1a4144', padding: '40px 0', textAlign: 'center' }}>
        <h1 style={{ color: '#f5f1ce', fontWeight: 800 }}>Gallery</h1>
        <p style={{ color: '#5cba7d' }}>Nature's finest moments, captured</p>
      </div>

      <section className="py-5">
        <div className="container">
          <div className="row g-3">
            {IMAGES.map((src, idx) => (
              <div className="col-6 col-md-4 col-lg-3" key={src}>
                <img
                  src={src}
                  alt={`Forest scene ${idx + 1}`}
                  className="gallery-img"
                  onClick={() => setSelectedImg(src)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox — renders only when selectedImg is set (stateful) */}
      {selectedImg && (
        <div className="lightbox-overlay" onClick={() => setSelectedImg(null)}>
          <button className="close-lb" onClick={() => setSelectedImg(null)}>×</button>
          <img src={selectedImg} alt="Enlarged" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </main>
  )
}

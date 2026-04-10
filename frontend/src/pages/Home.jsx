import { useState, useEffect, useRef } from 'react'
import HighlightCard from '../components/HighlightCard'
import EventCard     from '../components/EventCard'

/* ─── OOJS LeafParticle class ───────────────────────────────────────────────
   Drives the 3D CSS floating leaf using requestAnimationFrame.
   Uses CSS: perspective, transform-style: preserve-3d, rotateX/Y/Z
 ──────────────────────────────────────────────────────────────────────────── */
class LeafParticle {
  constructor(el) {
    this.el      = el
    this.rotX    = 0; this.rotY = 0; this.rotZ = 0
    this.floatY  = 0; this.dir  = 1
    this.running = true
    this._tick()
  }
  _tick() {
    if (!this.running) return
    this.rotX += 0.4; this.rotY += 0.6; this.rotZ += 0.2
    this.floatY += 0.03 * this.dir
    if (this.floatY > 8 || this.floatY < -8) this.dir *= -1
    this.el.style.transform =
      `translateY(${this.floatY}px) rotateX(${this.rotX}deg) rotateY(${this.rotY}deg) rotateZ(${this.rotZ}deg)`
    requestAnimationFrame(() => this._tick())
  }
  destroy() { this.running = false }
}

/* ─── Slide data ─────────────────────────────────────────────────────────── */
const SLIDES = [
  { title: 'Forest',   quote: '"And into the forest I go, to lose my mind and find my soul"',       bg: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1400' },
  { title: 'Trees',    quote: '"I took a walk in the woods and came out taller than the trees"',     bg: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1400' },
  { title: 'Animals',  quote: '"Souls of the forest"',                                               bg: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=1400' },
  { title: 'Birds',    quote: '"Soaring spirits with earthly feet"',                                 bg: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=1400' },
  { title: 'Verdure',  quote: '"Verdant cathedral of towering giants"',                              bg: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1400' },
]

const HIGHLIGHTS = [
  { title: 'Sustainable Forest Management', description: 'Ensuring forests are maintained in ecological balance while meeting current needs.', bgImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600' },
  { title: 'Biodiversity Conservation',     description: 'Forests host 80% of terrestrial species — crucial for global biodiversity.',        bgImage: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=600' },
  { title: 'Climate Change Mitigation',     description: 'Forests sequester carbon dioxide, playing a critical climate-regulating role.',      bgImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600' },
]

const EVENTS = [
  { title: 'International Day of Forests (Mar 21)', description: 'UN-established observance with workshops, seminars and tree-planting drives across India.' },
  { title: 'Wildlife Week (Oct 1–7)',               description: 'Educational programs and conservation activities celebrating forests as wildlife habitat.' },
  { title: 'Van Mahotsav (Jul 1–7)',                description: 'India\'s annual Tree Plantation Week — over 50 million trees planted since 1950.' },
]

/**
 * Home — STATEFUL page component
 * Manages: currentSlide (slider), leafParticle ref (3D animation).
 * Demonstrates stateful/stateless architecture: Home is stateful,
 * HighlightCard and EventCard are stateless children.
 */
export default function Home() {
  const [current, setCurrent] = useState(0)
  const leafRef = useRef(null)
  const particleRef = useRef(null)

  /* Auto-advance slider every 5s */
  useEffect(() => {
    const id = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000)
    return () => clearInterval(id)
  }, [])

  /* Init LeafParticle OOJS class on mount */
  useEffect(() => {
    if (leafRef.current) {
      particleRef.current = new LeafParticle(leafRef.current)
    }
    return () => particleRef.current?.destroy()
  }, [])

  const prev = () => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)
  const next = () => setCurrent(c => (c + 1) % SLIDES.length)

  return (
    <>
      {/* 3D CSS Floating Leaf (LeafParticle OOJS class) */}
      <div className="leaf-3d-scene" aria-hidden="true">
        <div className="leaf-3d-container" ref={leafRef}>
          <div className="leaf-face front" />
          <div className="leaf-face back"  />
          <div className="leaf-face side"  />
        </div>
      </div>

      {/* ── Hero Slider (stateful) ── */}
      <div
        className="hero-slide"
        style={{ backgroundImage: `url(${SLIDES[current].bg})` }}
      >
        <div className="slide-text w-100">
          <div className="container d-flex justify-content-between align-items-end">
            <div>
              <h2>{SLIDES[current].title}</h2>
              <p>{SLIDES[current].quote}</p>
            </div>
            <div className="slider-arrows">
              <button onClick={prev}>‹</button>
              <button onClick={next}>›</button>
            </div>
          </div>
        </div>
      </div>
      <div className="slider-dots">
        {SLIDES.map((_, i) => (
          <button key={i} className={i === current ? 'active' : ''} onClick={() => setCurrent(i)} />
        ))}
      </div>

      {/* ── About Section ── */}
      <section className="py-5">
        <div className="container">
          <h2 className="section-title text-center">"Forests: The Earth's Lungs and Biodiversity Hotspots"</h2>
          <p className="fs-5" style={{ color: '#1a4144' }}>
            Forests act as the Earth's lungs by absorbing carbon dioxide and releasing oxygen, playing a crucial role
            in regulating the global climate. They host more than 80% of the world's terrestrial species and provide
            habitat and sustenance for countless organisms. Protecting these rich ecosystems is essential for sustaining
            life on Earth and combating climate change.
          </p>
        </div>
      </section>

      {/* ── Highlights (stateless HighlightCard children) ── */}
      <section className="py-5" style={{ background: '#1a4144' }}>
        <div className="container">
          <h2 className="text-center mb-4" style={{ color: '#f5f1ce' }}>Highlights</h2>
          <div className="row g-4">
            {HIGHLIGHTS.map(h => (
              <div className="col-md-4" key={h.title}>
                <HighlightCard {...h} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Events (stateless EventCard children) ── */}
      <section className="py-5" style={{ background: '#c66f44' }}>
        <div className="container">
          <h2 className="text-center mb-4" style={{ color: '#f5f1ce' }}>Events</h2>
          <div className="row g-4">
            {EVENTS.map(e => (
              <div className="col-md-4" key={e.title}>
                <EventCard {...e} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

/**
 * EventCard — STATELESS component
 * Displays a forestry event with image, title, and description.
 * No state — pure presentational component.
 */
export default function EventCard({ image, title, description }) {
  return (
    <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: 10, overflow: 'hidden' }}>
      {image && (
        <img src={image} alt={title} className="card-img-top"
          style={{ height: 200, objectFit: 'cover' }} />
      )}
      <div className="card-body" style={{ background: '#1a4144', color: '#f5f1ce' }}>
        <h5 className="card-title" style={{ color: '#5cba7d' }}>{title}</h5>
        <p className="card-text" style={{ fontSize: 14 }}>{description}</p>
      </div>
    </div>
  )
}

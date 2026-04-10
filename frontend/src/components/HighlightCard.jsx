/**
 * HighlightCard — STATELESS component
 * Receives data via props, renders a hover-reveal card.
 * Pure function — no side effects, no state.
 */
export default function HighlightCard({ title, description, bgImage }) {
  return (
    <div
      className="highlight-card"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <h5>{title}</h5>
      <div className="overlay">
        <h5>{title}</h5>
        <p style={{ fontSize: '14px', marginTop: 8 }}>{description}</p>
      </div>
    </div>
  )
}

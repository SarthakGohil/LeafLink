/**
 * About — STATELESS page component
 * No user interactions or data fetching — purely presentational.
 * Bootstrap grid used for responsive team layout.
 */
const TEAM = [
  { name: 'Kunj Vaghani',   role: 'Co-founder', bio: '"Woods are grim places. Farmers shoot squirrels, crows, magpies... Much notice she takes, being in league with God."' },
  { name: 'Jay Pipaliya',   role: 'Co-founder', bio: '"Agriculture has never been a single monolithic interest. We have always known differences among farmers."' },
  { name: 'Sneh Karanjia',  role: 'Co-founder', bio: '"I see a time when the farmer will not need to live in a cabin on a lonely farm. I see them enjoying lectures in beautiful halls."' },
  { name: 'Sarthak Gohil',  role: 'Co-founder', bio: '"When I went to first grade and the other children said their fathers were farmers, I simply didn\'t believe them."' },
]

export default function About() {
  return (
    <main>
      {/* Hero */}
      <div style={{
        height: 340,
        background: 'url(https://images.unsplash.com/photo-1511497584788-876760111969?w=1400) center/cover',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <h1 style={{ color: '#f5f1ce', fontWeight: 800, fontSize: '3rem', textShadow: '0 2px 8px rgba(0,0,0,.5)' }}>
          About Us
        </h1>
      </div>

      {/* About text */}
      <section className="py-5">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-md-6">
              <h2 className="section-title">Who We Are</h2>
              <p className="fs-5">
                Wood is a renewable, competitive and environment-friendly material — a basic need of modern society.
                LeafLink manages forests sustainably, efficiently and in a socially responsible manner across the globe.
              </p>
              <p className="fs-5 mt-3">
                A large proportion of our forest land has been created through afforestation projects, contributing
                to an increase in the world's forest area and locking up carbon dioxide in trees.
              </p>
            </div>
            <div className="col-md-6">
              <img
                src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=700"
                alt="Forest"
                className="img-fluid rounded"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,.2)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <div className="container">
        <div className="about-quote">
          "Wood is a renewable, competitive and environment-friendly material, it is a basic need of modern society."
          <br /><strong style={{ color: '#5cba7d' }}>― LeafLink.in</strong>
        </div>
      </div>

      {/* Team */}
      <section className="py-5">
        <div className="container">
          <h2 className="section-title text-center mb-4">Meet Our Team</h2>
          <p className="text-center mb-4" style={{ fontStyle: 'italic' }}>
            "Individuals can and do make a difference, but it takes a team to really mess things up"
          </p>
          <div className="row g-4">
            {TEAM.map(({ name, role, bio }) => (
              <div className="col-md-6" key={name}>
                <div className="team-card">
                  <h5>{name}</h5>
                  <span>{role}</span>
                  <p className="mt-2" style={{ fontSize: 14 }}>{bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-5" style={{ background: '#1a4144' }}>
        <div className="container text-center" style={{ color: '#f5f1ce' }}>
          <h2 style={{ color: '#5cba7d' }}>Our Values</h2>
          <p className="mt-3 fs-5">
            We manage our forests with openness, effectiveness and accountability and strive to be the best in class
            regarding sustainable forest management. We work with research and development to minimise any negative
            effect our operations could potentially have on biodiversity and environs.
          </p>
        </div>
      </section>
    </main>
  )
}

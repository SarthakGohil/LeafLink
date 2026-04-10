import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, API } from '../context/AuthContext'

/**
 * Profile — STATEFUL page component.
 * Displays: user card, personal/professional info, favorites section.
 * No ugly security block — clean modern layout.
 */
export default function Profile() {
  const { user, token, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [form,    setForm]    = useState({})
  const [status,  setStatus]  = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) setForm({
      name: user.name || '', phone: user.phone || '', bio: user.bio || '',
      location: user.location || '', occupation: user.occupation || '',
      company: user.company || '', website: user.website || '',
      linkedIn: user.linkedIn || '', github: user.github || '',
      gender: user.gender || '', dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
    })
  }, [user])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true); setStatus('')
    try {
      const res  = await fetch(`${API}/profile/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) { updateUser(data.user); setEditing(false); setStatus('✅ Profile updated!') }
      else setStatus((data.errors || [{ msg: data.error }]).map(e => e.msg).join(' '))
    } catch { setStatus('Could not save.') }
    setLoading(false)
  }

  if (!user) return null

  // Generate DiceBear avatar from name
  const avatarUrl = user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=1a4144&textColor=f5f1ce`
  const joinDate  = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : ''

  // Field rows for info cards
  const personalFields = [
    { icon: '✉️', label: 'Email',     val: user.email },
    { icon: '📞', label: 'Phone',     val: user.phone },
    { icon: '📍', label: 'Location',  val: user.location },
    { icon: '🎂', label: 'Birthday',  val: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-IN') : null },
    { icon: '⚧',  label: 'Gender',    val: user.gender ? user.gender.replace(/_/g, ' ') : null },
  ].filter(r => r.val)

  const professionalFields = [
    { icon: '👔', label: 'Occupation', val: user.occupation },
    { icon: '🏢', label: 'Company',    val: user.company },
    { icon: '🌐', label: 'Website',    val: user.website,  link: true },
    { icon: '💼', label: 'LinkedIn',   val: user.linkedIn, link: true },
    { icon: '🐙', label: 'GitHub',     val: user.github,   link: true },
  ].filter(r => r.val)

  return (
    <main style={{ background: '#f0ede0', minHeight: '100vh', paddingBottom: 60 }}>

      {/* ── Hero banner ── */}
      <div style={{ background: 'linear-gradient(135deg,#1a4144 0%,#2d6b50 60%,#5cba7d 100%)', height: 220, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative leaves */}
        {['🌿','🍃','🌱','🍀','🌾'].map((l,i) => (
          <span key={i} style={{ position:'absolute', fontSize: 36+i*8, opacity:.12, top: 20+i*30, left: i*22+'%', transform:`rotate(${i*25}deg)` }}>{l}</span>
        ))}
        {/* Avatar */}
        <div style={{ position:'absolute', bottom:-52, left:'50%', transform:'translateX(-50%)' }}>
          <img src={avatarUrl} alt="avatar"
            style={{ width:104, height:104, borderRadius:'50%', border:'4px solid #f5f1ce', background:'#1a4144', objectFit:'cover', boxShadow:'0 8px 24px rgba(0,0,0,.25)' }} />
        </div>
      </div>

      <div style={{ maxWidth:820, margin:'0 auto', padding:'64px 16px 0' }}>

        {/* ── Name, role, badges ── */}
        <div style={{ textAlign:'center', marginBottom:6 }}>
          <h2 style={{ color:'#1a4144', fontWeight:900, margin:0, fontSize:'1.7rem' }}>{user.name}</h2>
          <p style={{ color:'#5cba7d', fontWeight:700, margin:'6px 0 10px', fontSize:'1rem' }}>
            {user.occupation || 'LeafLink Member'}{user.company ? ` · ${user.company}` : ''}
          </p>
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
            {user.isEmailVerified &&
              <span style={badge('#e8f5e9','#2e7d32')}>✅ Verified</span>}
            <span style={badge('#e3f2fd','#1565c0')}>
              {user.role === 'admin' ? '👑 Admin' : '🌿 Member'}
            </span>
            {joinDate && <span style={badge('#f3e5f5','#6a1b9a')}>Since {joinDate}</span>}
            {user.location && <span style={badge('#fff8e1','#f57f17')}>📍 {user.location}</span>}
          </div>
        </div>

        {/* ── Bio ── */}
        {user.bio && (
          <p style={{ textAlign:'center', color:'#555', maxWidth:500, margin:'14px auto 0', fontStyle:'italic', lineHeight:1.6 }}>
            "{user.bio}"
          </p>
        )}

        {/* ── Social / link icons ── */}
        {(user.github || user.linkedIn || user.website) && (
          <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:16 }}>
            {user.github   && <SocialBtn href={user.github}   label="GitHub"   emoji="🐙" />}
            {user.linkedIn && <SocialBtn href={user.linkedIn} label="LinkedIn" emoji="💼" />}
            {user.website  && <SocialBtn href={user.website}  label="Website"  emoji="🌐" />}
          </div>
        )}

        {/* ── Status ── */}
        {status && (
          <p style={{ textAlign:'center', color: status.includes('✅') ? '#27ae60' : '#c0392b', fontWeight:700, marginTop:12 }}>
            {status}
          </p>
        )}

        {/* ── Action buttons ── */}
        <div style={{ display:'flex', gap:10, justifyContent:'center', margin:'22px 0' }}>
          <button onClick={() => { setEditing(e => !e); setStatus('') }} style={actionBtn('#1a4144','#f5f1ce')}>
            {editing ? '✕ Cancel' : '✏️ Edit Profile'}
          </button>
          <button onClick={() => { logout(); navigate('/') }} style={actionBtn('#c0392b','#fff')}>
            Logout
          </button>
        </div>

        {/* ── Read mode ── */}
        {!editing && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Info row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px,1fr))', gap:20 }}>
              {/* Personal */}
              <InfoCard title="📋 Personal Info" fields={personalFields} />
              {/* Professional */}
              <InfoCard title="💼 Professional" fields={professionalFields} />
            </div>

            {/* ── Favorites ── */}
            <div style={{ background:'#fff', borderRadius:16, padding:24, boxShadow:'0 2px 16px rgba(0,0,0,.07)' }}>
              <h5 style={{ color:'#1a4144', margin:'0 0 16px', fontWeight:800, fontSize:'1.05rem' }}>
                ❤️ Favourite Services
              </h5>
              {user.favorites && user.favorites.length > 0 ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                  {user.favorites.map(f => (
                    <FavoriteTag key={f} name={f} />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:'28px 0', color:'#aaa' }}>
                  <div style={{ fontSize:40 }}>🌱</div>
                  <p style={{ margin:'8px 0 4px', fontWeight:600 }}>No favourites yet</p>
                  <p style={{ fontSize:13, margin:0 }}>
                    Visit <a href="/services" style={{ color:'#5cba7d', fontWeight:700 }}>Services</a> and click ❤️ to save your favourites.
                  </p>
                </div>
              )}
            </div>

            {/* Stats row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px,1fr))', gap:14 }}>
              {[
                { emoji:'❤️', label:'Favourites', val: user.favorites?.length || 0 },
                { emoji:'📅', label:'Member Since', val: joinDate || '—' },
                { emoji:'✅', label:'Email',        val: user.isEmailVerified ? 'Verified' : 'Pending' },
                { emoji:'🎯', label:'Role',         val: user.role || 'user' },
              ].map(s => (
                <div key={s.label} style={{ background:'#1a4144', borderRadius:12, padding:'16px 14px', textAlign:'center' }}>
                  <div style={{ fontSize:26 }}>{s.emoji}</div>
                  <div style={{ color:'#f5f1ce', fontWeight:800, marginTop:4 }}>{s.val}</div>
                  <div style={{ color:'rgba(255,255,255,.5)', fontSize:11, marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ── Edit mode ── */}
        {editing && (
          <form onSubmit={handleSave}>
            <div style={{ background:'#fff', borderRadius:16, padding:28, boxShadow:'0 2px 16px rgba(0,0,0,.07)' }}>
              <h5 style={{ color:'#1a4144', marginBottom:20, fontWeight:800 }}>✏️ Edit Your Profile</h5>
              <div className="row g-3">
                {[
                  { name:'name',        label:'Full Name',    type:'text',     col:6 },
                  { name:'phone',       label:'Phone',        type:'tel',      col:6 },
                  { name:'location',    label:'Location',     type:'text',     col:6 },
                  { name:'gender',      label:'Gender',       type:'select',   col:6, opts:['','male','female','other','prefer_not_to_say'] },
                  { name:'dateOfBirth', label:'Date of Birth',type:'date',     col:6 },
                  { name:'occupation',  label:'Occupation',   type:'text',     col:6 },
                  { name:'company',     label:'Company',      type:'text',     col:6 },
                  { name:'website',     label:'Website URL',  type:'text',     col:6 },
                  { name:'linkedIn',    label:'LinkedIn',     type:'text',     col:6 },
                  { name:'github',      label:'GitHub',       type:'text',     col:6 },
                  { name:'bio',         label:'Bio',          type:'textarea', col:12 },
                ].map(f => (
                  <div className={`col-md-${f.col}`} key={f.name}>
                    <label style={{ display:'block', fontWeight:700, color:'#1a4144', fontSize:13, marginBottom:4 }}>{f.label}</label>
                    {f.type === 'select' ? (
                      <select name={f.name} value={form[f.name]} onChange={handleChange} style={inputStyle}>
                        {f.opts.map(o => <option key={o} value={o}>{o || '— Select —'}</option>)}
                      </select>
                    ) : f.type === 'textarea' ? (
                      <textarea name={f.name} value={form[f.name]} onChange={handleChange} rows={3} style={{ ...inputStyle, resize:'vertical' }} />
                    ) : (
                      <input name={f.name} type={f.type} value={form[f.name]} onChange={handleChange} style={inputStyle} />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:10, marginTop:24 }}>
                <button type="submit" disabled={loading}
                  style={{ background:'#5cba7d', color:'#fff', border:'none', borderRadius:10, padding:'11px 32px', fontWeight:800, cursor:'pointer', flex:1, fontSize:15 }}>
                  {loading ? 'Saving…' : 'Save Changes ✓'}
                </button>
                <button type="button" onClick={() => setEditing(false)}
                  style={{ background:'#f5f1ce', color:'#1a4144', border:'2px solid #ccc', borderRadius:10, padding:'11px 20px', fontWeight:700, cursor:'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}

/* ── Helper components (stateless) ────────────────────────────────────────── */
function InfoCard({ title, fields }) {
  return (
    <div style={{ background:'#fff', borderRadius:16, padding:24, boxShadow:'0 2px 16px rgba(0,0,0,.07)', minHeight:160 }}>
      <h5 style={{ color:'#1a4144', borderBottom:'2px solid #5cba7d', paddingBottom:10, marginBottom:18, fontWeight:800, fontSize:'1rem' }}>
        {title}
      </h5>
      {fields.length === 0 ? (
        <p style={{ color:'#bbb', fontSize:13 }}>No info added yet — click Edit Profile.</p>
      ) : fields.map(r => (
        <div key={r.label} style={{ display:'flex', gap:12, marginBottom:12, alignItems:'flex-start' }}>
          <span style={{ fontSize:20, minWidth:28 }}>{r.icon}</span>
          <div>
            <div style={{ fontSize:11, color:'#999', fontWeight:700, textTransform:'uppercase' }}>{r.label}</div>
            {r.link ? (
              <a href={r.val.startsWith('http') ? r.val : `https://${r.val}`} target="_blank" rel="noreferrer"
                style={{ color:'#5cba7d', fontWeight:700, wordBreak:'break-all' }}>{r.val}</a>
            ) : (
              <div style={{ color:'#1a4144', fontWeight:600 }}>{r.val}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function FavoriteTag({ name }) {
  const icons = { 'Reforestation Programs':'🌱','Wildlife Conservation':'🦁','Eco-Tourism':'🏕️','Sustainable Agriculture':'🌾','Carbon Offset Programs':'🌍','Forest Monitoring':'🛰️' }
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#e8f5e9', color:'#2e7d32', border:'1.5px solid #a5d6a7', borderRadius:20, padding:'6px 14px', fontWeight:700, fontSize:14 }}>
      {icons[name] || '🌿'} {name}
    </span>
  )
}

function SocialBtn({ href, label, emoji }) {
  const url = href.startsWith('http') ? href : `https://${href}`
  return (
    <a href={url} target="_blank" rel="noreferrer"
      style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#fff', color:'#1a4144', border:'1.5px solid #ddd', borderRadius:20, padding:'6px 16px', fontWeight:700, fontSize:13, textDecoration:'none', boxShadow:'0 1px 4px rgba(0,0,0,.07)', transition:'all .2s' }}>
      {emoji} {label}
    </a>
  )
}

/* ── Style helpers ─────────────────────────────────────────────────────────── */
const badge = (bg, color) => ({ background:bg, color, padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700 })
const actionBtn = (bg, color) => ({ background:bg, color, border:'none', borderRadius:10, padding:'10px 28px', fontWeight:800, cursor:'pointer', fontSize:14 })
const inputStyle = { width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #ddd', fontFamily:'inherit', fontSize:14, color:'#1a4144' }

import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Upload, Save, Check } from 'lucide-react'
import { VISUAL_THEMES, CAPTION_TONES } from '../data/mockData'
import './BrandKit.css'

const UPLOAD_SLOTS = [
    { key: 'headshot', label: 'Headshot', icon: '👤', required: true },
    { key: 'brkLogo', label: 'Brokerage Logo', icon: '🏢', required: false },
    { key: 'teamLogo', label: 'Team Logo', icon: '👥', required: false },
    { key: 'propPhoto', label: 'Property Photo', icon: '🏡', required: false },
    { key: 'customBg', label: 'Custom Background', icon: '🎨', required: false },
    { key: 'award', label: 'Award / Badge', icon: '🏆', required: false },
]

export default function BrandKit() {
    const { agent, setAgent, brandKit, updateBrandKit, isAuthenticated } = useApp()
    if (!isAuthenticated) return <Navigate to="/onboarding" replace />

    const [saved, setSaved] = useState(false)
    const [uploads, setUploads] = useState({
        headshot: true, brkLogo: true, teamLogo: false, propPhoto: false, customBg: false, award: false,
    })
    const [info, setInfo] = useState({
        name: agent.name, phone: agent.phone, license: agent.license,
        brokerage: agent.brokerage, website: agent.website, marketAreas: agent.marketAreas,
    })
    const [theme, setTheme] = useState(brandKit.theme)
    const [tone, setTone] = useState(brandKit.captionTone)
    const [primaryColor, setPrimaryColor] = useState(brandKit.primaryColor)

    const handleSave = () => {
        setAgent(prev => ({ ...prev, ...info }))
        updateBrandKit({ theme, captionTone: tone, primaryColor })
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
    }

    const toggleUpload = (key) => setUploads(p => ({ ...p, [key]: !p[key] }))

    return (
        <div className="bk-page" style={{ paddingTop: '64px' }}>
            <div className="bk-container">
                <div className="bk-header">
                    <div>
                        <h2>Brand Kit</h2>
                        <p>Your contact info is stamped programmatically after generation — never by AI.</p>
                    </div>
                    <button className="btn btn-primary" onClick={handleSave} id="save-brand-kit">
                        {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
                    </button>
                </div>

                <div className="bk-grid">
                    {/* Left column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Uploads */}
                        <div className="card">
                            <h4 style={{ marginBottom: '16px' }}>Asset Uploads <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>Max 6 · 10 MB each</span></h4>
                            <div className="bk-upload-grid">
                                {UPLOAD_SLOTS.map(slot => (
                                    <div key={slot.key}
                                        className={`bk-upload-tile ${slot.required ? 'required' : ''} ${uploads[slot.key] ? 'uploaded' : ''}`}
                                        onClick={() => toggleUpload(slot.key)}
                                        id={`upload-${slot.key}`}
                                    >
                                        {uploads[slot.key]
                                            ? <div className="bk-upload-check"><Check size={16} /></div>
                                            : <div className="bk-upload-icon">{slot.icon}</div>
                                        }
                                        <div className="bk-upload-label">{slot.label}</div>
                                        {slot.required && <div className="bk-upload-req">Required</div>}
                                        <div className="bk-upload-action">
                                            {uploads[slot.key] ? 'Change' : <><Upload size={10} /> Upload</>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Agent Info */}
                        <div className="card">
                            <h4 style={{ marginBottom: '16px' }}>Agent Information</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input id="bk-name" className="form-input" value={info.name} onChange={e => setInfo(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Phone</label>
                                        <input id="bk-phone" className="form-input" value={info.phone} onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))} placeholder="(310) 555-0100" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">License #</label>
                                        <input id="bk-license" className="form-input" value={info.license} onChange={e => setInfo(p => ({ ...p, license: e.target.value }))} placeholder="DRE #..." />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Brokerage</label>
                                        <input id="bk-brokerage" className="form-input" value={info.brokerage} onChange={e => setInfo(p => ({ ...p, brokerage: e.target.value }))} placeholder="Brokerage Name" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Website</label>
                                        <input id="bk-website" className="form-input" value={info.website} onChange={e => setInfo(p => ({ ...p, website: e.target.value }))} placeholder="yoursite.com" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Market Areas</label>
                                    <input id="bk-markets" className="form-input" value={info.marketAreas} onChange={e => setInfo(p => ({ ...p, marketAreas: e.target.value }))} placeholder="Beverly Hills, West Hollywood" />
                                    <span className="form-hint">Comma-separated markets. Used in image context only, never in contact stamp.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Visual theme */}
                        <div className="card">
                            <h4 style={{ marginBottom: '16px' }}>Visual Theme</h4>
                            <div className="bk-theme-grid">
                                {VISUAL_THEMES.map(t => (
                                    <button key={t.id}
                                        className={`bk-theme-btn ${theme === t.id ? 'selected' : ''}`}
                                        style={{ background: t.color }}
                                        onClick={() => setTheme(t.id)}
                                        id={`theme-${t.id}`}
                                        title={t.label}
                                    >
                                        {theme === t.id && <Check size={16} style={{ color: '#fff', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }} />}
                                        <span className="bk-theme-label">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Caption tone */}
                        <div className="card">
                            <h4 style={{ marginBottom: '16px' }}>Caption Tone</h4>
                            <div className="bk-tone-grid">
                                {CAPTION_TONES.map(t => (
                                    <button key={t.id}
                                        className={`bk-tone-btn ${tone === t.id ? 'selected' : ''}`}
                                        onClick={() => setTone(t.id)}
                                        id={`tone-${t.id}`}
                                    >
                                        {t.label}
                                        {tone === t.id && <Check size={13} style={{ marginLeft: 'auto' }} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Brand color */}
                        <div className="card">
                            <h4 style={{ marginBottom: '16px' }}>Brand Colors</h4>
                            <div className="form-label mb-2">Primary color</div>
                            <div className="bk-colors">
                                {['#2bee79', '#7c3aed', '#f97316', '#4fa3e0', '#f59e0b', '#ec4899', '#ef4444', '#06b6d4'].map(c => (
                                    <button key={c}
                                        className={`bk-color-swatch ${primaryColor === c ? 'selected' : ''}`}
                                        style={{ background: c }}
                                        onClick={() => setPrimaryColor(c)}
                                        title={c}
                                    />
                                ))}
                            </div>

                            {/* Preview card */}
                            <div className="bk-preview-card" style={{ background: `linear-gradient(135deg, ${primaryColor}18, ${primaryColor}06)`, borderColor: `${primaryColor}30` }}>
                                <div className="bk-preview-avatar" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}88)` }}>
                                    {agent.avatarInitials}
                                </div>
                                <div>
                                    <div className="bk-preview-name" style={{ color: primaryColor }}>{info.name || 'Agent Name'}</div>
                                    <div className="bk-preview-lic">{info.license || 'DRE #License'} · {info.brokerage || 'Brokerage'}</div>
                                </div>
                            </div>
                            <p className="form-hint" style={{ marginTop: '8px' }}>This color is used as the accent in all generated images.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

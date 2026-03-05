import { useState, useRef, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Upload, Save, Check, X, MapPin, Plus } from 'lucide-react'
import { VISUAL_THEMES, CAPTION_TONES, SUGGESTED_MARKETS } from '../data/mockData'
import './BrandKit.css'

const UPLOAD_SLOTS = [
    { key: 'headshot', label: 'Headshot', icon: '👤', required: true },
    { key: 'brkLogo', label: 'Brokerage Logo', icon: '🏢', required: false },
    { key: 'teamLogo', label: 'Team Logo', icon: '👥', required: false },
    { key: 'propPhoto', label: 'Property Photo', icon: '🏡', required: false },
    { key: 'customBg', label: 'Custom Background', icon: '🎨', required: false },
    { key: 'award', label: 'Award / Badge', icon: '🏆', required: false },
]

function MarketAreaSelector({ markets, onAdd, onRemove }) {
    const [query, setQuery] = useState('')
    const [open, setOpen] = useState(false)
    const inputRef = useRef(null)
    const containerRef = useRef(null)

    const suggestions = query.length > 0
        ? SUGGESTED_MARKETS.filter(m =>
            m.toLowerCase().includes(query.toLowerCase()) &&
            !markets.includes(m)
        ).slice(0, 6)
        : []

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && query.trim()) {
            e.preventDefault()
            const match = SUGGESTED_MARKETS.find(m => m.toLowerCase() === query.trim().toLowerCase())
            onAdd(match || query.trim())
            setQuery('')
            setOpen(false)
        }
        if (e.key === 'Escape') {
            setOpen(false)
        }
    }

    const handleSelect = (market) => {
        onAdd(market)
        setQuery('')
        setOpen(false)
        inputRef.current?.focus()
    }

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="market-selector" ref={containerRef}>
            {/* Current market chips */}
            {markets.length > 0 && (
                <div className="market-chips">
                    {markets.map(market => (
                        <span key={market} className="market-chip">
                            <MapPin size={10} />
                            {market}
                            <button
                                className="market-chip-remove"
                                onClick={() => onRemove(market)}
                                title={`Remove ${market}`}
                            >
                                <X size={10} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Search / add input */}
            <div className="market-input-wrap">
                <MapPin size={13} className="market-input-icon" />
                <input
                    ref={inputRef}
                    className="market-input"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setOpen(true) }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={markets.length === 0 ? 'Search city or neighborhood…' : 'Add another market…'}
                />
                {query && (
                    <button className="market-input-clear" onClick={() => { setQuery(''); setOpen(false) }}>
                        <X size={12} />
                    </button>
                )}
            </div>

            {/* Suggestions dropdown */}
            {open && suggestions.length > 0 && (
                <div className="market-dropdown">
                    {suggestions.map(market => (
                        <button key={market} className="market-suggestion" onClick={() => handleSelect(market)}>
                            <MapPin size={11} />
                            {market}
                        </button>
                    ))}
                    {query.trim() && !SUGGESTED_MARKETS.some(m => m.toLowerCase() === query.trim().toLowerCase()) && (
                        <button className="market-suggestion market-suggestion-custom" onClick={() => handleSelect(query.trim())}>
                            <Plus size={11} />
                            Add "{query.trim()}"
                        </button>
                    )}
                </div>
            )}

            <span className="form-hint" style={{ marginTop: '6px', display: 'block' }}>
                These markets drive your local news feed in Studio. Not included in image prompts.
            </span>
        </div>
    )
}

export default function BrandKit() {
    const { agent, setAgent, brandKit, updateBrandKit, isAuthenticated, addMarketArea, removeMarketArea } = useApp()
    if (!isAuthenticated) return <Navigate to="/onboarding" replace />

    const [saved, setSaved] = useState(false)
    const [uploads, setUploads] = useState({
        headshot: true, brkLogo: true, teamLogo: false, propPhoto: false, customBg: false, award: false,
    })
    const [info, setInfo] = useState({
        name: agent.name, phone: agent.phone, license: agent.license,
        brokerage: agent.brokerage, website: agent.website,
    })
    const [theme, setTheme] = useState(brandKit.theme)
    const [tone, setTone] = useState(brandKit.captionTone)
    const [primaryColor, setPrimaryColor] = useState(brandKit.primaryColor)

    const handleSave = async () => {
        const brandKitUpdate = { theme, captionTone: tone, primaryColor }
        setAgent(prev => ({ ...prev, ...info }))
        updateBrandKit(brandKitUpdate)
        try {
            await updateDoc(doc(db, 'agents', agent.uid), {
                ...info,
                brandKit: brandKitUpdate,
            })
        } catch (err) {
            console.error('BrandKit save failed:', err)
        }
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
                                    <MarketAreaSelector
                                        markets={agent.marketAreas}
                                        onAdd={addMarketArea}
                                        onRemove={removeMarketArea}
                                    />
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

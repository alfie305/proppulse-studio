import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useApp } from '../context/AppContext'
import { Check, Upload, User, Palette, ArrowRight, ArrowLeft, Loader, X } from 'lucide-react'
import { VISUAL_THEMES, CAPTION_TONES } from '../data/mockData'
import './Onboarding.css'

function formatPhone(raw) {
    const digits = raw.replace(/\D/g, '').slice(0, 10)
    if (digits.length < 4) return digits
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

const STATE_ABBR = {
    'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR','California':'CA',
    'Colorado':'CO','Connecticut':'CT','Delaware':'DE','Florida':'FL','Georgia':'GA',
    'Hawaii':'HI','Idaho':'ID','Illinois':'IL','Indiana':'IN','Iowa':'IA','Kansas':'KS',
    'Kentucky':'KY','Louisiana':'LA','Maine':'ME','Maryland':'MD','Massachusetts':'MA',
    'Michigan':'MI','Minnesota':'MN','Mississippi':'MS','Missouri':'MO','Montana':'MT',
    'Nebraska':'NE','Nevada':'NV','New Hampshire':'NH','New Jersey':'NJ','New Mexico':'NM',
    'New York':'NY','North Carolina':'NC','North Dakota':'ND','Ohio':'OH','Oklahoma':'OK',
    'Oregon':'OR','Pennsylvania':'PA','Rhode Island':'RI','South Carolina':'SC',
    'South Dakota':'SD','Tennessee':'TN','Texas':'TX','Utah':'UT','Vermont':'VT',
    'Virginia':'VA','Washington':'WA','West Virginia':'WV','Wisconsin':'WI','Wyoming':'WY',
    'District of Columbia':'DC',
}

async function searchCities(query) {
    const url = `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&countrycodes=us&limit=7&format=json&addressdetails=1&featuretype=city`
    const res = await fetch(url, { headers: { 'Accept-Language': 'en-US' } })
    const data = await res.json()
    const seen = new Set()
    const results = []
    for (const item of data) {
        const addr = item.address
        const city = addr.city || addr.town || addr.village || addr.county
        const state = addr.state
        if (!city || !state) continue
        const abbr = STATE_ABBR[state]
        if (!abbr) continue
        const label = `${city}, ${abbr}`
        if (seen.has(label)) continue
        seen.add(label)
        results.push(label)
    }
    return results
}

const STEPS = [
    { id: 1, label: 'Account', icon: <User size={16} /> },
    { id: 2, label: 'Brand Kit', icon: <Upload size={16} /> },
    { id: 3, label: 'Style', icon: <Palette size={16} /> },
]

const AUTH_ERRORS = {
    'auth/email-already-in-use': 'An account with this email already exists. Try logging in.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/popup-closed-by-user': null,
}

export default function Onboarding() {
    const { completeOnboarding, loginWithGoogle } = useApp()
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [uid, setUid] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [form, setForm] = useState({
        name: '', email: '', password: '',
        phone: '', license: '', brokerage: '', website: '', marketAreas: [],
        theme: 'luxury-dark', captionTone: 'professional',
        primaryColor: '#2bee79',
    })
    const [marketInput, setMarketInput] = useState('')
    const [marketSuggestions, setMarketSuggestions] = useState([])
    const [marketLoading, setMarketLoading] = useState(false)
    const marketDebounce = useRef(null)
    const marketRef = useRef(null)

    const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

    useEffect(() => {
        const q = marketInput.trim()
        if (q.length < 2) { setMarketSuggestions([]); return }
        clearTimeout(marketDebounce.current)
        marketDebounce.current = setTimeout(async () => {
            setMarketLoading(true)
            try {
                const results = await searchCities(q)
                setMarketSuggestions(results)
            } catch { setMarketSuggestions([]) }
            finally { setMarketLoading(false) }
        }, 350)
        return () => clearTimeout(marketDebounce.current)
    }, [marketInput])

    const selectMarket = (label) => {
        if (!form.marketAreas.includes(label)) {
            set('marketAreas', [...form.marketAreas, label])
        }
        setMarketInput('')
        setMarketSuggestions([])
        marketRef.current?.focus()
    }

    const removeMarket = (m) => set('marketAreas', form.marketAreas.filter(x => x !== m))

    const handleMarketKey = (e) => {
        if (e.key === 'Escape') setMarketSuggestions([])
    }

    const handleContinueStep1 = async () => {
        setError(null)
        setLoading(true)
        try {
            const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
            setUid(cred.user.uid)
            setStep(2)
        } catch (err) {
            const msg = AUTH_ERRORS[err.code]
            if (msg !== null) setError(msg ?? 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setError(null)
        setLoading(true)
        try {
            const { uid: googleUid, isNewUser } = await loginWithGoogle()
            if (isNewUser) {
                setUid(googleUid)
                setStep(2)
            } else {
                navigate('/studio')
            }
        } catch (err) {
            const msg = AUTH_ERRORS[err.code]
            if (msg !== null) setError(msg ?? 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleEnterStudio = async () => {
        setError(null)
        setLoading(true)
        try {
            await completeOnboarding(form, uid)
            navigate('/studio')
        } catch (err) {
            setError('Failed to save your profile. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const next = () => {
        if (step === 1) {
            handleContinueStep1()
        } else if (step === 2) {
            setStep(3)
        } else {
            handleEnterStudio()
        }
    }

    const back = () => setStep(s => s - 1)

    return (
        <div className="onboarding-page">
            <div className="onboarding-card">
                {/* Progress steps */}
                <div className="onboarding-steps">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="step-wrap">
                            <div className={`step-circle ${step === s.id ? 'active' : step > s.id ? 'done' : ''}`}>
                                {step > s.id ? <Check size={14} /> : s.icon}
                            </div>
                            <span className={`step-label ${step === s.id ? 'active' : ''}`}>{s.label}</span>
                            {i < STEPS.length - 1 && <div className={`step-connector ${step > s.id ? 'done' : ''}`} />}
                        </div>
                    ))}
                </div>

                <div className="onboarding-body animate-fade" key={step}>
                    {step === 1 && (
                        <>
                            <h2>Create your account</h2>
                            <p>Start with your basics. Email verified separately.</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input id="ob-name" className="form-input" placeholder="Alfie Reynolds" value={form.name} onChange={e => set('name', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input id="ob-email" className="form-input" type="email" placeholder="you@yourdomain.com" value={form.email} onChange={e => set('email', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <input id="ob-password" className="form-input" type="password" placeholder="Create a strong password" value={form.password} onChange={e => set('password', e.target.value)} />
                                </div>
                                {error && <p className="auth-error">{error}</p>}
                                <div className="sso-divider"><span>or</span></div>
                                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', gap: '10px' }}
                                    onClick={handleGoogleSignIn} disabled={loading}>
                                    <span style={{ fontSize: '18px' }}>G</span> Continue with Google
                                </button>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h2>Set up your brand kit</h2>
                            <p>Your contact info is stamped programmatically — never AI-generated.</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                                <div className="upload-tiles">
                                    {[
                                        { key: 'headshot', label: 'Headshot', note: 'Required', icon: '👤' },
                                        { key: 'brkLogo', label: 'Brokerage Logo', note: 'Optional', icon: '🏢' },
                                        { key: 'teamLogo', label: 'Team Logo', note: 'Optional', icon: '👥' },
                                        { key: 'propPhoto', label: 'Property Photo', note: 'Optional', icon: '🏡' },
                                        { key: 'customBg', label: 'Custom Background', note: 'Optional', icon: '🎨' },
                                        { key: 'award', label: 'Award / Badge', note: 'Optional', icon: '🏆' },
                                    ].map(u => (
                                        <div key={u.key} className={`upload-tile ${u.key === 'headshot' ? 'required' : ''}`}>
                                            <div className="upload-icon">{u.icon}</div>
                                            <div className="upload-name">{u.label}</div>
                                            <div className="upload-note">{u.note}</div>
                                            <Upload size={12} style={{ color: 'var(--text-muted)', marginTop: '4px' }} />
                                        </div>
                                    ))}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input id="ob-phone" className="form-input" placeholder="(310) 555-0100" value={form.phone}
                                        onChange={e => set('phone', formatPhone(e.target.value))} />
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">License #</label>
                                        <input id="ob-license" className="form-input" placeholder="DRE #02193847" value={form.license} onChange={e => set('license', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Brokerage</label>
                                        <input id="ob-brokerage" className="form-input" placeholder="Compass Real Estate" value={form.brokerage} onChange={e => set('brokerage', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Website</label>
                                        <input id="ob-website" className="form-input" placeholder="yoursite.com" value={form.website} onChange={e => set('website', e.target.value)} />
                                    </div>
                                    <div className="form-group" style={{ position: 'relative' }}>
                                        <label className="form-label">Market Areas</label>
                                        <div className="market-tag-input">
                                            {form.marketAreas.map(m => (
                                                <span key={m} className="market-tag">
                                                    {m}
                                                    <button type="button" onClick={() => removeMarket(m)}><X size={10} /></button>
                                                </span>
                                            ))}
                                            <input
                                                ref={marketRef}
                                                className="market-tag-field"
                                                placeholder="Type a city…"
                                                value={marketInput}
                                                onChange={e => setMarketInput(e.target.value)}
                                                onKeyDown={handleMarketKey}
                                                autoComplete="off"
                                            />
                                            {marketLoading && <span className="market-spinner"><Loader size={12} className="spin" /></span>}
                                        </div>
                                        {marketSuggestions.length > 0 && (
                                            <ul className="market-dropdown">
                                                {marketSuggestions.map(s => (
                                                    <li key={s} onMouseDown={() => selectMarket(s)}>{s}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <h2>Choose your visual style</h2>
                            <p>Pick a theme and tone. You can change these anytime in Brand Kit.</p>
                            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Visual Theme</label>
                                    <div className="theme-picker">
                                        {VISUAL_THEMES.map(t => (
                                            <button key={t.id} className={`theme-option ${form.theme === t.id ? 'selected' : ''}`}
                                                style={{ background: t.color }} onClick={() => set('theme', t.id)}
                                                title={t.label}
                                            >
                                                {form.theme === t.id && <Check size={16} style={{ color: '#fff', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.7))' }} />}
                                                <span className="theme-option-label">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Caption Tone</label>
                                    <div className="tone-picker">
                                        {CAPTION_TONES.map(t => (
                                            <button key={t.id} className={`tone-option ${form.captionTone === t.id ? 'selected' : ''}`}
                                                onClick={() => set('captionTone', t.id)}
                                            >{t.label}</button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Brand Color</label>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        {['#2bee79', '#7c3aed', '#f97316', '#4fa3e0', '#f59e0b', '#ec4899'].map(c => (
                                            <button key={c} className={`color-swatch ${form.primaryColor === c ? 'selected' : ''}`}
                                                style={{ background: c }} onClick={() => set('primaryColor', c)} />
                                        ))}
                                    </div>
                                </div>
                                {error && <p className="auth-error">{error}</p>}
                            </div>
                        </>
                    )}
                </div>

                <div className="onboarding-footer">
                    {step > 1 && <button className="btn btn-ghost" onClick={back} disabled={loading}><ArrowLeft size={14} /> Back</button>}
                    <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={next} disabled={loading}>
                        {loading
                            ? <Loader size={14} className="spin" />
                            : <>{step === 3 ? 'Enter Studio' : 'Continue'} <ArrowRight size={14} /></>
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

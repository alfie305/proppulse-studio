import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Check, Upload, User, Palette, ArrowRight, ArrowLeft } from 'lucide-react'
import { VISUAL_THEMES, CAPTION_TONES } from '../data/mockData'
import './Onboarding.css'

const STEPS = [
    { id: 1, label: 'Account', icon: <User size={16} /> },
    { id: 2, label: 'Brand Kit', icon: <Upload size={16} /> },
    { id: 3, label: 'Style', icon: <Palette size={16} /> },
]

export default function Onboarding() {
    const { completeOnboarding } = useApp()
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [form, setForm] = useState({
        name: '', email: '', password: '',
        phone: '', license: '', brokerage: '', website: '', marketAreas: '',
        theme: 'luxury-dark', captionTone: 'professional',
        primaryColor: '#2bee79',
    })

    const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

    const next = () => {
        if (step < 3) setStep(s => s + 1)
        else {
            completeOnboarding({ name: form.name, phone: form.phone, license: form.license, brokerage: form.brokerage, website: form.website, marketAreas: form.marketAreas })
            navigate('/studio')
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
                                <div className="sso-divider"><span>or</span></div>
                                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', gap: '10px' }}>
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
                                    <input id="ob-phone" className="form-input" placeholder="(310) 555-0100" value={form.phone} onChange={e => set('phone', e.target.value)} />
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
                                    <div className="form-group">
                                        <label className="form-label">Market Areas</label>
                                        <input id="ob-markets" className="form-input" placeholder="Beverly Hills, West Hollywood" value={form.marketAreas} onChange={e => set('marketAreas', e.target.value)} />
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
                            </div>
                        </>
                    )}
                </div>

                <div className="onboarding-footer">
                    {step > 1 && <button className="btn btn-ghost" onClick={back}><ArrowLeft size={14} /> Back</button>}
                    <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={next}>
                        {step === 3 ? 'Enter Studio' : 'Continue'} <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}

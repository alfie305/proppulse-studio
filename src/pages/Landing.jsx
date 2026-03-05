import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Zap, TrendingUp, Image, Download, Clock, Shield, X, Loader } from 'lucide-react'
import './Landing.css'

const AUTH_ERRORS = {
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
}

function LoginModal({ onClose }) {
    const { login, loginWithGoogle } = useApp()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleLogin = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            await login(email, password)
            navigate('/studio')
        } catch (err) {
            setError(AUTH_ERRORS[err.code] ?? 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogle = async () => {
        setError(null)
        setLoading(true)
        try {
            const { isNewUser } = await loginWithGoogle()
            navigate(isNewUser ? '/onboarding' : '/studio')
        } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') {
                setError(AUTH_ERRORS[err.code] ?? 'Something went wrong. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Sign in to PropPulse</h3>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" placeholder="you@yourdomain.com"
                            value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" placeholder="Your password"
                            value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    {error && <p className="auth-error">{error}</p>}
                    <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center' }}>
                        {loading ? <Loader size={14} className="spin" /> : 'Sign In'}
                    </button>
                </form>
                <div className="sso-divider"><span>or</span></div>
                <button className="btn btn-secondary" onClick={handleGoogle} disabled={loading}
                    style={{ width: '100%', justifyContent: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>G</span> Continue with Google
                </button>
                <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    No account? <Link to="/onboarding" onClick={onClose} style={{ color: 'var(--accent)' }}>Sign up free</Link>
                </p>
            </div>
        </div>
    )
}

const FEATURES = [
    { icon: <TrendingUp size={22} />, title: 'Live News Hooks', desc: 'Top 5 real estate stories refreshed daily — injected into your content automatically.' },
    { icon: <Image size={22} />, title: '6 AI Variations', desc: 'Get six branded image variants per campaign, sized for every platform.' },
    { icon: <Download size={22} />, title: '4 Platform Formats', desc: 'Instagram Feed, Story, LinkedIn, and Email Flyer — all in one click.' },
    { icon: <Clock size={22} />, title: 'Under 45 Seconds', desc: 'From campaign selection to download — faster than any design tool.' },
    { icon: <Shield size={22} />, title: 'Accurate Contact Info', desc: 'Your name, license, and brokerage are stamped programmatically — never AI-generated.' },
    { icon: <Zap size={22} />, title: 'Credit-Based Usage', desc: 'Flexible credits with monthly reset. Top up anytime. No design skill required.' },
]

const CAMPAIGN_TYPES = ['Market Update', 'Just Listed', 'Just Sold', 'Open House', 'Buyer Tips', 'Rate Update']

const THEMES = [
    { name: 'Luxury Dark', color: '#1a1a2e' },
    { name: 'Clean Light', color: '#f8f8f2' },
    { name: 'Modern Green', color: '#1b4332' },
    { name: 'Bold Violet', color: '#4a0080' },
    { name: 'Warm Rust', color: '#7c2d12' },
    { name: 'Sky Minimal', color: '#e0f2fe' },
]

export default function Landing() {
    const [showLogin, setShowLogin] = useState(false)

    return (
        <div className="landing">
            {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
            {/* Hero */}
            <section className="hero">
                <div className="hero-bg" aria-hidden />
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge animate-fade"><Zap size={13} /> Powered by Gemini AI</div>
                        <h1 className="hero-headline animate-fade" style={{ animationDelay: '0.1s' }}>
                            Branded content for<br /><span className="text-accent">real estate agents</span><br />in minutes.
                        </h1>
                        <p className="hero-sub animate-fade" style={{ animationDelay: '0.2s' }}>
                            PropPulse Studio generates six AI-branded images per campaign — tied to live real estate news — sized for Instagram, LinkedIn, and Email. No design skills required.
                        </p>
                        <div className="hero-actions animate-fade" style={{ animationDelay: '0.3s' }}>
                            <Link to="/onboarding" className="btn btn-primary btn-lg">Start Free →</Link>
                            <button className="btn btn-ghost btn-lg" onClick={() => setShowLogin(true)}>Demo the Studio</button>
                        </div>
                        <p className="hero-disclaimer">Free tier available · No credit card required to start</p>
                    </div>

                    {/* Mock Studio Preview */}
                    <div className="hero-preview animate-fade" style={{ animationDelay: '0.35s' }}>
                        <div className="preview-card">
                            <div className="preview-header">
                                <div className="preview-dot red" /><div className="preview-dot yellow" /><div className="preview-dot green" />
                                <span className="preview-title">PropPulse Studio</span>
                            </div>
                            <div className="preview-body">
                                <div className="preview-news-feed">
                                    <div className="preview-label">📰 Live News</div>
                                    {['Rates drop to 6.4%', 'Inventory up 18% YoY', 'LA median hits $985K'].map((h, i) => (
                                        <div key={i} className={`preview-news-item ${i === 0 ? 'active' : ''}`}>
                                            {i === 0 && <span className="preview-hot">🔥</span>} {h}
                                        </div>
                                    ))}
                                </div>
                                <div className="preview-grid">
                                    <div className="preview-label">🎨 Generated Assets</div>
                                    <div className="preview-assets">
                                        {['#2bee79', '#7c3aed', '#4fa3e0', '#f97316', '#4ade80', '#a855f7'].map((c, i) => (
                                            <div key={i} className="preview-asset" style={{ background: `linear-gradient(135deg, ${c}22, ${c}08)`, borderColor: `${c}33` }}>
                                                <div className="preview-asset-dot" style={{ background: c }} />
                                                <div className="preview-asset-label">Var {i + 1}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Campaign Types */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2>Six campaign types. Infinite variations.</h2>
                        <p>Every format in under 45 seconds.</p>
                    </div>
                    <div className="campaign-grid">
                        {CAMPAIGN_TYPES.map(c => (
                            <div key={c} className="campaign-chip">{c}</div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="section alt-bg">
                <div className="container">
                    <div className="section-header">
                        <h2>Everything you need to post consistently.</h2>
                        <p>Built for independent real estate agents who value their time.</p>
                    </div>
                    <div className="features-grid">
                        {FEATURES.map(f => (
                            <div key={f.title} className="feature-card card">
                                <div className="feature-icon">{f.icon}</div>
                                <h4>{f.title}</h4>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Visual Themes */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2>Six stunning visual themes.</h2>
                        <p>Choose your style, match your brand.</p>
                    </div>
                    <div className="themes-row">
                        {THEMES.map(t => (
                            <div key={t.name} className="theme-swatch" style={{ background: t.color }}>
                                <span className="theme-swatch-name" style={{ color: t.color === '#f8f8f2' || t.color === '#e0f2fe' ? '#111' : '#fff' }}>{t.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="section alt-bg" id="pricing">
                <div className="container">
                    <div className="section-header">
                        <h2>Simple, honest pricing.</h2>
                        <p>Start free. Upgrade when you're ready to go full throttle.</p>
                    </div>
                    <div className="pricing-grid">
                        {/* Free */}
                        <div className="pricing-card card">
                            <div className="pricing-plan">Free</div>
                            <div className="pricing-price">$0<span>/mo</span></div>
                            <ul className="pricing-features">
                                <li>✓ Limited credits/month</li>
                                <li>✓ Watermarked outputs</li>
                                <li>✓ 3 campaign types</li>
                                <li>✓ 7-day asset history</li>
                                <li className="muted">✗ Full brand kit storage</li>
                            </ul>
                            <Link to="/onboarding" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Get Started Free</Link>
                        </div>
                        {/* Paid */}
                        <div className="pricing-card card featured">
                            <div className="featured-badge"><Zap size={11} /> Most Popular</div>
                            <div className="pricing-plan">Pro</div>
                            <div className="pricing-price">$45<span>/mo</span></div>
                            <ul className="pricing-features">
                                <li>✓ 120 credits/month</li>
                                <li>✓ No watermark</li>
                                <li>✓ All 6 campaign types</li>
                                <li>✓ Unlimited asset history</li>
                                <li>✓ Full brand kit storage</li>
                            </ul>
                            <Link to="/onboarding" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Start Pro Trial</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="container cta-inner">
                    <h2>Ready to post like a pro?</h2>
                    <p>Join hundreds of agents who generate branded content in minutes, not days.</p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '24px' }}>
                        <Link to="/onboarding" className="btn btn-primary btn-lg">Create Free Account</Link>
                        <button className="btn btn-ghost btn-lg" onClick={() => setShowLogin(true)}>Try the Studio Demo</button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <span className="logo-text">PropPulse<span className="logo-accent"> Studio</span></span>
                    <p>© 2026 PropPulse Studio · Built for real estate agents</p>
                </div>
            </footer>
        </div>
    )
}

import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Zap, Check, Plus, AlertTriangle, CreditCard } from 'lucide-react'
import './Billing.css'

const CREDIT_BUNDLES = [
    { id: 'b1', credits: 24, price: '$8', label: '2 campaigns', perCredit: '$0.33' },
    { id: 'b2', credits: 60, price: '$16', label: '5 campaigns', perCredit: '$0.27', popular: true },
    { id: 'b3', credits: 120, price: '$28', label: '10 campaigns', perCredit: '$0.23' },
]

const BILLING_HISTORY = [
    { date: 'Mar 1, 2026', description: 'Pro Plan — March', amount: '$45.00', status: 'Paid' },
    { date: 'Feb 1, 2026', description: 'Pro Plan — February', amount: '$45.00', status: 'Paid' },
    { date: 'Jan 15, 2026', description: 'Credit Bundle — 60cr', amount: '$16.00', status: 'Paid' },
    { date: 'Jan 1, 2026', description: 'Pro Plan — January', amount: '$45.00', status: 'Paid' },
]

export default function Billing() {
    const { agent, addCredits, isAuthenticated, isLowCredit, isOutOfCredits } = useApp()
    if (!isAuthenticated) return <Navigate to="/onboarding" replace />

    const [boughtBundle, setBoughtBundle] = useState(null)

    const creditPercent = Math.round((agent.credits / agent.creditMax) * 100)
    const barColor = isOutOfCredits ? 'var(--danger)' : isLowCredit ? 'var(--warning)' : 'var(--accent)'

    const buyBundle = (bundle) => {
        addCredits(bundle.credits)
        setBoughtBundle(bundle.id)
        setTimeout(() => setBoughtBundle(null), 3000)
    }

    return (
        <div className="billing-page" style={{ paddingTop: '64px' }}>
            <div className="billing-container">
                <h2 style={{ marginBottom: '28px' }}>Billing & Credits</h2>

                <div className="billing-grid">
                    {/* Left: Plan + Credits */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Current Plan */}
                        <div className={`plan-card card ${agent.plan === 'paid' ? 'plan-pro' : ''}`}>
                            <div className="plan-header">
                                <div>
                                    <div className="plan-name">{agent.plan === 'paid' ? 'Pro Plan' : 'Free Plan'}</div>
                                    <div className="plan-price">{agent.plan === 'paid' ? '$45' : '$0'}<span>/month</span></div>
                                </div>
                                {agent.plan === 'paid' && <div className="badge badge-green animate-glow"><Zap size={10} /> Active</div>}
                            </div>
                            <ul className="plan-features">
                                {agent.plan === 'paid' ? [
                                    '✓ 120 credits / month',
                                    '✓ No watermarks',
                                    '✓ All 6 campaign types',
                                    '✓ Unlimited asset history',
                                    '✓ Full brand kit storage',
                                ] : [
                                    '✓ Limited credits / month',
                                    '✗ Watermarked outputs',
                                    '✓ 3 campaign types only',
                                    '✓ 7-day asset history',
                                    '✗ Limited brand kit storage',
                                ].map(f => <li key={f}>{f}</li>)}
                            </ul>
                            {agent.plan === 'free' ? (
                                <button className="btn btn-primary" id="upgrade-btn" style={{ width: '100%', justifyContent: 'center' }}>
                                    <Zap size={14} /> Upgrade to Pro — $45/mo
                                </button>
                            ) : (
                                <button className="btn btn-ghost btn-sm" style={{ marginTop: '8px' }}>Manage Subscription</button>
                            )}
                        </div>

                        {/* Credit Meter */}
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h4><Zap size={14} style={{ color: 'var(--accent)', marginRight: '6px' }} />Credits</h4>
                                <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)' }}>{agent.credits}<span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.875rem' }}>/{agent.creditMax}</span></span>
                            </div>
                            <div className="progress-bar" style={{ height: '10px' }}>
                                <div className="progress-fill" style={{ width: `${creditPercent}%`, background: barColor }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <span>{agent.credits} remaining</span>
                                <span>Resets on billing anniversary</span>
                            </div>
                            {isLowCredit && !isOutOfCredits && (
                                <div className="alert alert-warning" style={{ marginTop: '14px' }}>
                                    <AlertTriangle size={14} /> <span>Low credit — under 20% remaining</span>
                                </div>
                            )}
                            {isOutOfCredits && (
                                <div className="alert alert-danger" style={{ marginTop: '14px' }}>
                                    <AlertTriangle size={14} /> <span>Out of credits — generation is paused</span>
                                </div>
                            )}

                            {/* Credit rules */}
                            <div className="credit-rules">
                                <div className="credit-rule"><span className="rule-cost">12 cr</span> Generate 6 variations</div>
                                <div className="credit-rule"><span className="rule-cost">2 cr</span> Refine single asset</div>
                                <div className="credit-rule"><span className="rule-cost">1 cr</span> Regenerate caption</div>
                                <div className="credit-rule"><span className="rule-cost">0 cr</span> Re-download</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Bundles + History */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Credit top-ups */}
                        <div className="card">
                            <h4 style={{ marginBottom: '16px' }}><Plus size={14} style={{ marginRight: '6px', color: 'var(--accent)' }} />Credit Top-Ups</h4>
                            <p style={{ marginBottom: '16px', fontSize: '0.875rem' }}>Buy extra credits anytime. No rollover at month end.</p>
                            <div className="bundles-grid">
                                {CREDIT_BUNDLES.map(b => (
                                    <div key={b.id} className={`bundle-card ${b.popular ? 'popular' : ''}`}>
                                        {b.popular && <div className="bundle-popular-badge"><Zap size={10} /> Best Value</div>}
                                        <div className="bundle-credits"><span>{b.credits}</span> credits</div>
                                        <div className="bundle-label">{b.label}</div>
                                        <div className="bundle-per">{b.perCredit}/credit</div>
                                        <button
                                            className={`btn ${b.popular ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                            id={`buy-bundle-${b.id}`}
                                            style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
                                            onClick={() => buyBundle(b)}
                                        >
                                            {boughtBundle === b.id ? <><Check size={12} /> Added!</> : <>{b.price} → Add {b.credits}cr</>}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Billing History */}
                        <div className="card">
                            <h4 style={{ marginBottom: '16px' }}><CreditCard size={14} style={{ marginRight: '6px', color: 'var(--text-muted)' }} />Billing History</h4>
                            <div className="billing-table">
                                <div className="billing-row header">
                                    <span>Date</span><span>Description</span><span>Amount</span><span>Status</span>
                                </div>
                                {BILLING_HISTORY.map((r, i) => (
                                    <div key={i} className="billing-row">
                                        <span>{r.date}</span>
                                        <span>{r.description}</span>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.amount}</span>
                                        <span><span className="badge badge-green">{r.status}</span></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

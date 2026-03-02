import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Users, DollarSign, Zap, TrendingUp, TrendingDown, Star, AlertCircle, Settings } from 'lucide-react'
import { ADMIN_STATS } from '../data/mockData'
import './Admin.css'

function StatCard({ label, value, sub, icon, color = 'accent', trend }) {
    return (
        <div className="stat-card card">
            <div className="stat-top">
                <div className={`stat-icon stat-icon-${color}`}>{icon}</div>
                {trend && (
                    <div className={`stat-trend ${trend > 0 ? 'up' : 'down'}`}>
                        {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            {sub && <div className="stat-sub">{sub}</div>}
        </div>
    )
}

const RECENT_USERS = [
    { name: 'Jordan Hayes', plan: 'paid', credits: 84, gens: 12, joined: 'Mar 1' },
    { name: 'Priya Nair', plan: 'paid', credits: 24, gens: 31, joined: 'Feb 28' },
    { name: 'Carlos Silva', plan: 'free', credits: 8, gens: 3, joined: 'Feb 27' },
    { name: 'Maya Johnson', plan: 'paid', credits: 110, gens: 5, joined: 'Feb 26' },
    { name: 'Derek Olson', plan: 'free', credits: 0, gens: 8, joined: 'Feb 25' },
]

export default function Admin() {
    const { isAuthenticated } = useApp()
    if (!isAuthenticated) return <Navigate to="/onboarding" replace />

    return (
        <div className="admin-page" style={{ paddingTop: '64px' }}>
            <div className="admin-container">
                <div className="admin-header">
                    <div>
                        <div className="badge badge-orange" style={{ marginBottom: '8px' }}><Settings size={10} /> Internal Dashboard</div>
                        <h2>Admin Overview</h2>
                        <p>PropPulse Studio · March 2026</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <StatCard label="Total Users" value={ADMIN_STATS.totalUsers} icon={<Users size={18} />} color="accent" trend={12} sub={`${ADMIN_STATS.freeUsers} free · ${ADMIN_STATS.paidUsers} paid`} />
                    <StatCard label="Monthly Revenue" value={`$${ADMIN_STATS.mrr.toLocaleString()}`} icon={<DollarSign size={18} />} color="green" trend={8} sub="MRR · Stripe" />
                    <StatCard label="Generations" value={ADMIN_STATS.generationsThisMonth.toLocaleString()} icon={<Zap size={18} />} color="blue" trend={22} sub="This month" />
                    <StatCard label="Avg / Paid User" value={ADMIN_STATS.avgGenerationsPerPaid} icon={<TrendingUp size={18} />} color="purple" sub="Generations/month" />
                    <StatCard label="Monthly Churn" value={`${ADMIN_STATS.churnRate}%`} icon={<TrendingDown size={18} />} color="orange" trend={-2} />
                    <StatCard label="NPS Score" value={ADMIN_STATS.nps} icon={<Star size={18} />} color="yellow" sub="Target: >40" trend={5} />
                </div>

                <div className="admin-grid">
                    {/* Users table */}
                    <div className="card">
                        <h4 style={{ marginBottom: '16px' }}>Recent Users</h4>
                        <div className="admin-table">
                            <div className="admin-row header">
                                <span>Name</span><span>Plan</span><span>Credits</span><span>Gens</span><span>Joined</span><span>Action</span>
                            </div>
                            {RECENT_USERS.map((u, i) => (
                                <div key={i} className="admin-row" id={`user-row-${i}`}>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</span>
                                    <span>
                                        <span className={`badge ${u.plan === 'paid' ? 'badge-green' : 'badge-muted'}`}>
                                            {u.plan === 'paid' ? 'Pro' : 'Free'}
                                        </span>
                                    </span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                                        <span style={{ color: u.credits === 0 ? 'var(--danger)' : u.credits < 20 ? 'var(--warning)' : 'var(--text-primary)' }}>{u.credits}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>/120</span>
                                    </span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.gens}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{u.joined}</span>
                                    <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.6875rem' }}>Adjust</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Conversion funnel */}
                        <div className="card">
                            <h4 style={{ marginBottom: '16px' }}>Conversion Funnel</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                    { label: 'Signups', count: 347, pct: 100, color: 'var(--accent)' },
                                    { label: 'Completed Onboarding', count: 298, pct: 86, color: '#4fa3e0' },
                                    { label: 'First Generation', count: 241, pct: 70, color: '#a855f7' },
                                    { label: 'Paid Conversion', count: 129, pct: 37, color: '#f97316' },
                                ].map(f => (
                                    <div key={f.label}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
                                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.count} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({f.pct}%)</span></span>
                                        </div>
                                        <div className="progress-bar" style={{ height: '6px' }}>
                                            <div className="progress-fill" style={{ width: `${f.pct}%`, background: f.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Credit adjustments */}
                        <div className="card">
                            <h4 style={{ marginBottom: '12px' }}><AlertCircle size={14} style={{ color: 'var(--warning)', marginRight: '6px' }} />Manual Credit Adjustment</h4>
                            <p style={{ fontSize: '0.875rem', marginBottom: '14px' }}>Grant or revoke credits for a specific agent account.</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <input className="form-input" placeholder="Agent ID or email" id="adj-agent-id" />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <input className="form-input" placeholder="Credits (e.g. 24)" type="number" id="adj-credits" />
                                    <button className="btn btn-secondary" id="adj-grant">Grant</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

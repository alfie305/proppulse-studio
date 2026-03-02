import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Download, Filter, Grid, List } from 'lucide-react'
import { MOCK_LIBRARY_ASSETS, CAMPAIGN_TYPES, OUTPUT_FORMATS } from '../data/mockData'
import './AssetLibrary.css'

const PLATFORM_COLORS = {
    'Instagram Feed': { bg: 'rgba(225,48,108,0.15)', color: '#e1306c' },
    'Instagram Story': { bg: 'rgba(131,58,180,0.15)', color: '#833ab4' },
    'LinkedIn': { bg: 'rgba(0,119,181,0.15)', color: '#0077b5' },
    'Email Flyer': { bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
}

function AssetCard({ asset, view }) {
    const pc = PLATFORM_COLORS[asset.platform] || { bg: 'rgba(255,255,255,0.1)', color: '#888' }
    const campaignLabel = CAMPAIGN_TYPES.find(c => c.id === asset.campaignType)?.label || asset.campaignType
    const date = new Date(asset.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    if (view === 'list') return (
        <div className="lib-list-row animate-fade" id={`lib-asset-${asset.id}`}>
            <div className="lib-list-thumb" style={{ background: `linear-gradient(135deg, ${asset.gradientFrom}, ${asset.gradientTo})` }}>
                <div className="lib-thumb-dot" style={{ background: asset.accent }} />
            </div>
            <div className="lib-list-info">
                <span className="lib-campaign">{campaignLabel} · Var {asset.variant}</span>
                <span className="lib-date">{date}</span>
            </div>
            <div className="lib-list-platform">
                <span className="badge" style={{ background: pc.bg, color: pc.color }}>{asset.platform}</span>
            </div>
            <div className="lib-dims">{asset.dims}</div>
            <button className="btn btn-ghost btn-sm"><Download size={13} /> Download</button>
        </div>
    )

    return (
        <div className="lib-card animate-fade" id={`lib-asset-${asset.id}`}>
            <div className="lib-card-thumb" style={{ background: `linear-gradient(135deg, ${asset.gradientFrom}, ${asset.gradientTo})` }}>
                <div className="lib-thumb-visual">
                    <div className="lib-thumb-circle" style={{ background: asset.accent }} />
                    <div className="lib-thumb-lines">
                        <div className="lib-thumb-line" style={{ background: `${asset.accent}80` }} />
                        <div className="lib-thumb-line" style={{ background: 'rgba(255,255,255,0.2)' }} />
                    </div>
                </div>
                <div className="lib-card-badges">
                    <span className="badge" style={{ background: pc.bg, color: pc.color, fontSize: '0.5625rem' }}>{asset.platform}</span>
                    <span className="badge badge-muted" style={{ fontSize: '0.5625rem' }}>Var {asset.variant}</span>
                </div>
            </div>
            <div className="lib-card-body">
                <div className="lib-campaign">{campaignLabel}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span className="lib-date">{date}</span>
                    <button className="btn btn-ghost btn-sm"><Download size={12} /></button>
                </div>
            </div>
        </div>
    )
}

export default function AssetLibrary() {
    const { agent, isAuthenticated } = useApp()
    if (!isAuthenticated) return <Navigate to="/onboarding" replace />

    const [view, setView] = useState('grid')
    const [filterCampaign, setFilterCampaign] = useState('all')
    const [filterPlatform, setFilterPlatform] = useState('all')

    const filtered = MOCK_LIBRARY_ASSETS.filter(a => {
        if (filterCampaign !== 'all' && a.campaignType !== filterCampaign) return false
        if (filterPlatform !== 'all' && a.platform !== filterPlatform) return false
        return true
    })

    return (
        <div className="lib-page" style={{ paddingTop: '64px' }}>
            <div className="lib-container">
                <div className="lib-header">
                    <div>
                        <h2>Asset Library</h2>
                        <p>{MOCK_LIBRARY_ASSETS.length} assets · {agent.plan === 'free' ? '7-day retention (Free)' : 'Unlimited retention (Pro)'}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="lib-toolbar">
                    <div style={{ display: 'flex', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                            <select className="lib-select" value={filterCampaign} onChange={e => setFilterCampaign(e.target.value)} id="filter-campaign">
                                <option value="all">All Campaigns</option>
                                {CAMPAIGN_TYPES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                        </div>
                        <select className="lib-select" value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} id="filter-platform">
                            <option value="all">All Platforms</option>
                            {OUTPUT_FORMATS.map(f => <option key={f.id} value={f.label}>{f.label}</option>)}
                        </select>
                    </div>

                    <div className="tabs" style={{ width: 'auto' }}>
                        <button className={`tab ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')} id="view-grid"><Grid size={14} /></button>
                        <button className={`tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')} id="view-list"><List size={14} /></button>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="lib-empty">
                        <span style={{ fontSize: '2rem' }}>📂</span>
                        <h3>No assets match your filters</h3>
                        <p>Try adjusting your campaign or platform filter.</p>
                    </div>
                ) : view === 'grid' ? (
                    <div className="lib-grid">
                        {filtered.map(a => <AssetCard key={a.id} asset={a} view="grid" />)}
                    </div>
                ) : (
                    <div className="lib-list">
                        {filtered.map(a => <AssetCard key={a.id} asset={a} view="list" />)}
                    </div>
                )}

                {agent.plan === 'free' && (
                    <div className="alert alert-warning" style={{ marginTop: '24px' }}>
                        <span>⚠️</span>
                        <span>Free tier: Assets are deleted after 7 days. <strong>Upgrade to Pro</strong> to keep them forever.</span>
                    </div>
                )}
            </div>
        </div>
    )
}

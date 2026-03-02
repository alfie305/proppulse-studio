import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { Navigate } from 'react-router-dom'
import {
    Flame, Clock, Zap, Copy, Check, Download,
    RefreshCw, Play, ChevronDown, X, AlertTriangle, ImageIcon
} from 'lucide-react'
import {
    NEWS_STORIES, CAMPAIGN_TYPES, OUTPUT_FORMATS,
    GENERATION_STEPS, MOCK_GENERATED_ASSETS
} from '../data/mockData'
import './Studio.css'

function NewsCard({ story, selected, onSelect }) {
    return (
        <button
            className={`news-card ${selected ? 'selected' : ''}`}
            onClick={() => onSelect(story)}
            id={`news-${story.id}`}
        >
            <div className="news-card-top">
                <span className={`badge badge-${story.category === 'Rates' ? 'blue' : story.category === 'Local Data' ? 'orange' : 'muted'}`}>
                    {story.category}
                </span>
                {story.hot && (
                    <span className="hot-badge"><Flame size={10} /> Hot</span>
                )}
                <span className="news-recency"><Clock size={10} /> {story.recency} · {story.source}</span>
            </div>
            <p className="news-headline">{story.headline}</p>
            {selected && <p className="news-summary">{story.summary}</p>}
        </button>
    )
}

function CampaignBtn({ campaign, selected, onSelect }) {
    return (
        <button
            className={`campaign-btn ${selected ? 'selected' : ''}`}
            onClick={() => onSelect(campaign)}
            id={`campaign-${campaign.id}`}
        >
            <span className="campaign-emoji">{campaign.icon}</span>
            <span>{campaign.label}</span>
        </button>
    )
}

function GeneratedAssetCard({ asset, onRefine, agentIsFree }) {
    const [copied, setCopied] = useState(false)
    const [formatOpen, setFormatOpen] = useState(false)

    const copyCaption = () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const platformColors = {
        'Instagram Feed': '#e1306c',
        'Instagram Story': '#833ab4',
        'LinkedIn': '#0077b5',
        'Email Flyer': '#f97316',
    }

    return (
        <div className="asset-card animate-fade" style={{ animationDelay: `${(asset.variant - 1) * 0.07}s` }}>
            {/* Image preview */}
            <div className="asset-preview" style={{ background: `linear-gradient(135deg, ${asset.gradientFrom}, ${asset.gradientTo})` }}>
                <div className="asset-brand-overlay">
                    <div className="asset-agent-dot" style={{ background: asset.accent }} />
                    <div className="asset-lines">
                        <div className="asset-line l1" style={{ background: `${asset.accent}60` }} />
                        <div className="asset-line l2" />
                    </div>
                    <div className="asset-stamp">
                        <span style={{ color: asset.accent }}>●</span> Agent Stamped
                    </div>
                </div>
                {agentIsFree && <div className="watermark-badge">Watermark</div>}
                <div className="asset-var-num">Var {asset.variant}</div>
                <div className="asset-platform-badge" style={{ background: platformColors[asset.platform] || '#555' }}>
                    {asset.platform}
                </div>
            </div>

            {/* Actions */}
            <div className="asset-card-footer">
                <div className="asset-dims">{asset.dims}</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => onRefine(asset)} title="Refine this asset (2 credits)">
                        <RefreshCw size={12} /> Refine
                    </button>
                    <div className="format-dropdown">
                        <button className="btn btn-primary btn-sm" onClick={() => setFormatOpen(!formatOpen)}>
                            <Download size={12} /> Download <ChevronDown size={11} />
                        </button>
                        {formatOpen && (
                            <div className="format-menu">
                                {OUTPUT_FORMATS.map(f => (
                                    <button key={f.id} className="format-item" onClick={() => setFormatOpen(false)}>
                                        <span>{f.label}</span>
                                        <span className="format-dims">{f.dims}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function CaptionBlock({ campaign, newsStory }) {
    const [copied, setCopied] = useState(false)
    const caption = newsStory
        ? `📊 ${newsStory.headline}\n\nThe market is shifting — and now is the time to act. ${newsStory.summary.slice(0, 120)}...\n\nReady to navigate this market? Let's connect.\n\n📞 (310) 555-0192 | DRE #02193847`
        : `📊 Market Update\n\nThe real estate market is always moving. Stay informed, stay ahead.\n\nReady to make your next move? Let's talk. DM me or call directly.\n\n📞 Your Agent · DRE #License`
    const hashtags = ['#RealEstate', '#MarketUpdate', '#HomeBuying', '#RealtorLife', '#BeverlyHills', '#LARealty', '#PropPulse']

    const handleCopy = () => {
        navigator.clipboard.writeText(caption + '\n\n' + hashtags.join(' ')).catch(() => { })
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="caption-block">
            <div className="caption-header">
                <span className="form-label">Caption</span>
                <button className="btn btn-ghost btn-sm" onClick={handleCopy} id="copy-caption-btn">
                    {copied ? <><Check size={12} style={{ color: 'var(--accent)' }} /> Copied!</> : <><Copy size={12} /> Copy</>}
                </button>
            </div>
            <div className="caption-text">{caption}</div>
            <div className="hashtag-row">
                {hashtags.map(h => (
                    <span key={h} className="hashtag-chip">{h}</span>
                ))}
            </div>
        </div>
    )
}

export default function Studio() {
    const { agent, isAuthenticated, deductCredits, isOutOfCredits } = useApp()

    if (!isAuthenticated) return <Navigate to="/onboarding" replace />

    const [selectedNews, setSelectedNews] = useState(null)
    const [selectedCampaign, setSelectedCampaign] = useState(null)
    const [generating, setGenerating] = useState(false)
    const [genStep, setGenStep] = useState(0)
    const [genProgress, setGenProgress] = useState(0)
    const [generatedAssets, setGeneratedAssets] = useState([])

    const generate = async () => {
        if (!selectedCampaign || isOutOfCredits) return
        setGenerating(true)
        setGenStep(0)
        setGenProgress(0)
        setGeneratedAssets([])

        for (let i = 0; i < GENERATION_STEPS.length; i++) {
            await new Promise(r => setTimeout(r, 600 + Math.random() * 400))
            setGenStep(i + 1)
            setGenProgress(Math.round(((i + 1) / GENERATION_STEPS.length) * 100))
        }

        deductCredits(12)
        setGeneratedAssets(MOCK_GENERATED_ASSETS)
        setGenerating(false)
    }

    const handleRefine = (asset) => {
        if (agent.credits < 2) return
        deductCredits(2)
    }

    return (
        <div className="studio-page" style={{ paddingTop: '64px' }}>
            {/* Left Panel */}
            <aside className="studio-sidebar">
                <div className="sidebar-section">
                    <div className="sidebar-section-label">📰 Live News Feed</div>
                    <div className="news-list">
                        {NEWS_STORIES.map(story => (
                            <NewsCard key={story.id} story={story} selected={selectedNews?.id === story.id} onSelect={setSelectedNews} />
                        ))}
                    </div>
                </div>

                <div className="sidebar-section">
                    <div className="sidebar-section-label">🎯 Campaign Type</div>
                    <div className="campaign-grid-studio">
                        {CAMPAIGN_TYPES.map(c => (
                            <CampaignBtn key={c.id} campaign={c} selected={selectedCampaign?.id === c.id} onSelect={setSelectedCampaign} />
                        ))}
                    </div>
                </div>

                {/* Brand kit summary */}
                <div className="brand-kit-summary">
                    <div className="bk-avatar">{agent.avatarInitials}</div>
                    <div>
                        <div className="bk-name">{agent.name}</div>
                        <div className="bk-license">{agent.license} · {agent.brokerage}</div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="studio-main">
                {/* Generate CTA */}
                <div className="generate-bar">
                    <div>
                        {selectedCampaign
                            ? <><strong>{selectedCampaign.label}</strong> campaign · {selectedNews ? `"${selectedNews.headline.slice(0, 50)}…"` : 'No news hook selected'}</>
                            : <span style={{ color: 'var(--text-muted)' }}>Select a campaign type to begin</span>
                        }
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span className={`credit-cost ${!selectedCampaign ? 'dim' : ''}`}>
                            <Zap size={12} /> 12 credits
                        </span>
                        {isOutOfCredits && (
                            <span className="alert alert-danger" style={{ padding: '7px 12px', gap: '6px' }}>
                                <AlertTriangle size={13} /> Out of credits
                            </span>
                        )}
                        <button
                            id="generate-btn"
                            className="btn btn-primary"
                            disabled={!selectedCampaign || generating || isOutOfCredits}
                            onClick={generate}
                        >
                            <Play size={14} />
                            {generating ? 'Generating…' : 'Generate Campaign'}
                        </button>
                    </div>
                </div>

                {/* Generation Progress */}
                {generating && (
                    <div className="gen-progress-wrap animate-fade">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                {GENERATION_STEPS[genStep - 1] || 'Initializing…'}
                            </span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)' }}>{genProgress}%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${genProgress}%` }} />
                        </div>
                        <div className="gen-steps-list">
                            {GENERATION_STEPS.map((s, i) => (
                                <div key={i} className={`gen-step ${i < genStep ? 'done' : i === genStep ? 'active' : ''}`}>
                                    {i < genStep ? <Check size={11} /> : i === genStep ? <span className="gen-dot animate-pulse" /> : <span className="gen-dot dim" />}
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!generating && generatedAssets.length === 0 && (
                    <div className="studio-empty">
                        <div className="studio-empty-icon"><ImageIcon size={36} /></div>
                        <h3>Your generated assets will appear here</h3>
                        <p>Select a campaign type, optionally pick a news hook, then hit Generate.</p>
                        <div className="quick-start-pills">
                            {CAMPAIGN_TYPES.slice(0, 3).map(c => (
                                <button key={c.id} className="btn btn-ghost btn-sm" onClick={() => setSelectedCampaign(c)}>
                                    {c.icon} {c.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Generated Assets Grid */}
                {generatedAssets.length > 0 && (
                    <div className="gen-results">
                        <div className="gen-results-header">
                            <h3>6 Variations Generated <span className="badge badge-green">✓ Ready</span></h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-ghost btn-sm" onClick={generate} disabled={isOutOfCredits}>
                                    <RefreshCw size={13} /> Regenerate All
                                </button>
                            </div>
                        </div>

                        <div className="assets-grid">
                            {generatedAssets.map(asset => (
                                <GeneratedAssetCard
                                    key={asset.id}
                                    asset={asset}
                                    onRefine={handleRefine}
                                    agentIsFree={agent.plan === 'free'}
                                />
                            ))}
                        </div>

                        <CaptionBlock campaign={selectedCampaign} newsStory={selectedNews} />
                    </div>
                )}
            </main>
        </div>
    )
}

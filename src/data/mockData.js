// Mock data for PropPulse Studio — simulates live backend data

export const mockAgent = {
    id: 'agent_alfie_001',
    name: 'Alfie Reynolds',
    phone: '(310) 555-0192',
    license: 'DRE #02193847',
    brokerage: 'Compass Real Estate',
    website: 'alfiereynolds.com',
    marketAreas: 'Beverly Hills, West Hollywood, Bel Air',
    avatarInitials: 'AR',
    plan: 'paid', // 'free' | 'paid'
    credits: 68,
    creditMax: 120,
    memberSince: 'January 2026',
}

export const mockBrandKit = {
    hasHeadshot: true,
    hasBrokerageLogo: true,
    hasTeamLogo: false,
    hasPropertyPhoto: false,
    hasCustomBg: false,
    hasAwardBadge: false,
    primaryColor: '#2bee79',
    secondaryColor: '#09100d',
    theme: 'luxury-dark',    // one of 6 themes
    captionTone: 'professional', // one of 4 tones
}

export const NEWS_STORIES = [
    {
        id: 'news-1',
        hot: true,
        category: 'Rates',
        headline: 'Mortgage Rates Drop to 6.4% — Lowest Since September 2023',
        summary: 'The 30-year fixed-rate mortgage fell to 6.4% this week, offering renewed purchasing power for buyers who had been priced out. Economists attribute the dip to cooler-than-expected jobs data and Fed commentary.',
        source: 'Reuters',
        recency: '2h ago',
    },
    {
        id: 'news-2',
        hot: false,
        category: 'Trends',
        headline: 'Inventory Surge: Listings Up 18% YoY in West Coast Markets',
        summary: 'New listing volume on the West Coast jumped 18% year-over-year in February, giving buyers more options. Agents report multiple-offer situations declining as competition moderates.',
        source: 'NAR',
        recency: '5h ago',
    },
    {
        id: 'news-3',
        hot: true,
        category: 'Local Data',
        headline: 'LA County Median Home Price Hits $985K Record High',
        summary: 'The median sale price in Los Angeles County reached $985,000 last month — a 12% year-over-year increase. Luxury inventory under $2M sold fastest, with a median of 9 days on market.',
        source: 'CAR',
        recency: '8h ago',
    },
    {
        id: 'news-4',
        hot: false,
        category: 'Trends',
        headline: 'Remote Work Wind-Down Reshaping Suburb Demand',
        summary: 'Return-to-office mandates from major tech employers are shifting buyer preferences back toward urban cores and commuter corridors, reversing the pandemic-era suburban surge.',
        source: 'Bloomberg',
        recency: '1d ago',
    },
    {
        id: 'news-5',
        hot: false,
        category: 'Rates',
        headline: 'Fed Signals Two Rate Cuts Possible in 2026 Second Half',
        summary: 'Federal Reserve minutes released Wednesday indicate committee members are projecting two potential cuts in the second half of 2026 contingent on continued inflation softening.',
        source: 'WSJ',
        recency: '1d ago',
    },
]

export const CAMPAIGN_TYPES = [
    { id: 'market-update', label: 'Market Update', icon: '📊', credits: 12 },
    { id: 'just-listed', label: 'Just Listed', icon: '🏡', credits: 12 },
    { id: 'just-sold', label: 'Just Sold', icon: '🎉', credits: 12 },
    { id: 'open-house', label: 'Open House', icon: '🚪', credits: 12 },
    { id: 'buyer-tips', label: 'Buyer Tips', icon: '💡', credits: 12 },
    { id: 'rate-update', label: 'Rate Update', icon: '📉', credits: 12 },
]

export const OUTPUT_FORMATS = [
    { id: 'square', label: 'Instagram Feed', dims: '2048×2048', platform: 'Instagram', ratio: '1:1' },
    { id: 'story', label: 'Instagram Story', dims: '1080×1920', platform: 'Instagram', ratio: '9:16' },
    { id: 'portrait', label: 'LinkedIn', dims: '1200×1500', platform: 'LinkedIn', ratio: '4:5' },
    { id: 'email', label: 'Email Flyer', dims: '600×900', platform: 'Email', ratio: '2:3' },
]

export const VISUAL_THEMES = [
    { id: 'luxury-dark', label: 'Luxury Dark', color: '#1a1a2e' },
    { id: 'clean-light', label: 'Clean Light', color: '#f8f8f2' },
    { id: 'modern-green', label: 'Modern Green', color: '#1b4332' },
    { id: 'bold-violet', label: 'Bold Violet', color: '#4a0080' },
    { id: 'warm-rust', label: 'Warm Rust', color: '#7c2d12' },
    { id: 'sky-minimal', label: 'Sky Minimal', color: '#e0f2fe' },
]

export const CAPTION_TONES = [
    { id: 'professional', label: 'Professional' },
    { id: 'approachable', label: 'Approachable' },
    { id: 'authoritative', label: 'Authoritative' },
    { id: 'inspirational', label: 'Inspirational' },
]

export const GENERATION_STEPS = [
    'Authenticating workspace',
    'Validating credits',
    'Loading brand kit',
    'Loading news hook',
    'Crafting image prompts',
    'Generating variations (1/6)',
    'Generating variations (2/6)',
    'Generating variations (3/6)',
    'Generating variations (4/6)',
    'Running Sharp overlays',
    'Resizing for platforms',
    'Storing to cloud',
]

export const MOCK_GENERATED_ASSETS = [
    {
        id: 'asset-001',
        campaignType: 'market-update',
        variant: 1,
        platform: 'Instagram Feed',
        format: 'square',
        dims: '2048×2048',
        gradientFrom: '#1a2f1e',
        gradientTo: '#0f1a14',
        accent: '#2bee79',
        createdAt: '2026-03-02T15:30:00Z',
    },
    {
        id: 'asset-002',
        campaignType: 'market-update',
        variant: 2,
        platform: 'Instagram Feed',
        format: 'square',
        dims: '2048×2048',
        gradientFrom: '#1a1a2e',
        gradientTo: '#0d0d1a',
        accent: '#7c3aed',
        createdAt: '2026-03-02T15:30:00Z',
    },
    {
        id: 'asset-003',
        campaignType: 'market-update',
        variant: 3,
        platform: 'LinkedIn',
        format: 'portrait',
        dims: '1200×1500',
        gradientFrom: '#1b2838',
        gradientTo: '#0a1628',
        accent: '#4fa3e0',
        createdAt: '2026-03-02T15:30:00Z',
    },
    {
        id: 'asset-004',
        campaignType: 'market-update',
        variant: 4,
        platform: 'Instagram Story',
        format: 'story',
        dims: '1080×1920',
        gradientFrom: '#2d1b54',
        gradientTo: '#0d0a1e',
        accent: '#a855f7',
        createdAt: '2026-03-02T15:30:00Z',
    },
    {
        id: 'asset-005',
        campaignType: 'market-update',
        variant: 5,
        platform: 'Email Flyer',
        format: 'email',
        dims: '600×900',
        gradientFrom: '#1a0a08',
        gradientTo: '#0d0704',
        accent: '#f97316',
        createdAt: '2026-03-02T15:30:00Z',
    },
    {
        id: 'asset-006',
        campaignType: 'market-update',
        variant: 6,
        platform: 'Instagram Story',
        format: 'story',
        dims: '1080×1920',
        gradientFrom: '#0a1f0d',
        gradientTo: '#061409',
        accent: '#22c55e',
        createdAt: '2026-03-02T15:30:00Z',
    },
]

export const MOCK_LIBRARY_ASSETS = [
    ...MOCK_GENERATED_ASSETS,
    {
        id: 'asset-007', campaignType: 'just-listed', variant: 1, platform: 'Instagram Feed', format: 'square', dims: '2048×2048',
        gradientFrom: '#1e1a2e', gradientTo: '#0f0d1a', accent: '#818cf8', createdAt: '2026-03-01T10:15:00Z',
    },
    {
        id: 'asset-008', campaignType: 'just-sold', variant: 2, platform: 'LinkedIn', format: 'portrait', dims: '1200×1500',
        gradientFrom: '#1a2e1a', gradientTo: '#0d1a0d', accent: '#4ade80', createdAt: '2026-02-28T14:00:00Z',
    },
    {
        id: 'asset-009', campaignType: 'open-house', variant: 3, platform: 'Email Flyer', format: 'email', dims: '600×900',
        gradientFrom: '#2e1a1a', gradientTo: '#1a0d0d', accent: '#f87171', createdAt: '2026-02-27T09:30:00Z',
    },
]

export const ADMIN_STATS = {
    totalUsers: 347,
    freeUsers: 218,
    paidUsers: 129,
    mrr: 5805,
    generationsThisMonth: 2841,
    avgGenerationsPerPaid: 22,
    churnRate: 4.2,
    nps: 52,
}

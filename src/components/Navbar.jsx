import { Link, NavLink, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Zap, AlertTriangle, Settings, Library, LayoutDashboard, CreditCard, LogIn, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import './Navbar.css'

export default function Navbar() {
    const { agent, isLowCredit, isOutOfCredits, login, isAuthenticated } = useApp()
    const location = useLocation()
    const isLanding = location.pathname === '/'
    const [dropdownOpen, setDropdownOpen] = useState(false)

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                {/* Logo */}
                <Link to={isAuthenticated ? '/studio' : '/'} className="navbar-logo">
                    <div className="logo-mark">P</div>
                    <span className="logo-text">PropPulse<span className="logo-accent"> Studio</span></span>
                </Link>

                {isAuthenticated ? (
                    <>
                        {/* Nav Links */}
                        <div className="navbar-links">
                            <NavLink to="/studio" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><LayoutDashboard size={15} />Studio</NavLink>
                            <NavLink to="/library" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Library size={15} />Library</NavLink>
                            <NavLink to="/brand-kit" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Settings size={15} />Brand Kit</NavLink>
                            <NavLink to="/billing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><CreditCard size={15} />Billing</NavLink>
                        </div>

                        {/* Credits + Avatar */}
                        <div className="navbar-right">
                            {/* Credit Pill */}
                            <Link to="/billing" className={`credit-pill ${isLowCredit ? 'low' : ''} ${isOutOfCredits ? 'empty' : ''}`}>
                                {isOutOfCredits
                                    ? <><AlertTriangle size={13} /> Out of credits</>
                                    : isLowCredit
                                        ? <><AlertTriangle size={13} /> {agent.credits} credits</>
                                        : <><Zap size={13} /> {agent.credits} / {agent.creditMax} cr</>
                                }
                            </Link>

                            {/* Plan badge */}
                            <span className={`plan-badge ${agent.plan}`}>{agent.plan === 'paid' ? 'Pro' : 'Free'}</span>

                            {/* Avatar */}
                            <button className="avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                                <div className="avatar">{agent.avatarInitials}</div>
                                <ChevronDown size={14} />
                            </button>

                            {dropdownOpen && (
                                <div className="avatar-dropdown" onClick={() => setDropdownOpen(false)}>
                                    <div className="avatar-dropdown-header">
                                        <div className="avatar lg">{agent.avatarInitials}</div>
                                        <div>
                                            <div className="fw-600">{agent.name}</div>
                                            <div className="text-muted text-sm">{agent.brokerage}</div>
                                        </div>
                                    </div>
                                    <div className="divider" style={{ margin: '12px 0' }} />
                                    <NavLink to="/brand-kit" className="dropdown-item">Brand Kit</NavLink>
                                    <NavLink to="/billing" className="dropdown-item">Billing & Credits</NavLink>
                                    <NavLink to="/admin" className="dropdown-item">Admin Dashboard</NavLink>
                                    <div className="divider" style={{ margin: '12px 0' }} />
                                    <button className="dropdown-item danger" onClick={() => window.location.href = '/'}>Sign Out</button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="navbar-right">
                        {!isLanding && (
                            <Link to="/" className="nav-link">Home</Link>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={login}>
                            <LogIn size={14} /> Demo Login
                        </button>
                        <Link to="/onboarding" className="btn btn-primary btn-sm">Get Started</Link>
                    </div>
                )}
            </div>
        </nav>
    )
}

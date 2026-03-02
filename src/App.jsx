import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Studio from './pages/Studio'
import BrandKit from './pages/BrandKit'
import AssetLibrary from './pages/AssetLibrary'
import Billing from './pages/Billing'
import Admin from './pages/Admin'

function AppInner() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/studio" element={<Studio />} />
                <Route path="/brand-kit" element={<BrandKit />} />
                <Route path="/library" element={<AssetLibrary />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    )
}

export default function App() {
    return (
        <AppProvider>
            <AppInner />
        </AppProvider>
    )
}

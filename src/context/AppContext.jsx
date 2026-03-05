import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '../lib/firebase'

const AppContext = createContext(null)

export function AppProvider({ children }) {
    const [agent, setAgent] = useState(null)
    const [brandKit, setBrandKit] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [authLoading, setAuthLoading] = useState(true)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const snap = await getDoc(doc(db, 'agents', user.uid))
                if (snap.exists()) {
                    const data = snap.data()
                    setAgent(data)
                    setBrandKit(data.brandKit ?? null)
                    setIsAuthenticated(true)
                } else {
                    // User exists in Firebase Auth but has no Firestore doc yet (mid-onboarding)
                    setAgent({ uid: user.uid, email: user.email })
                    setIsAuthenticated(false)
                }
            } else {
                setAgent(null)
                setBrandKit(null)
                setIsAuthenticated(false)
            }
            setAuthLoading(false)
        })
        return unsub
    }, [])

    const login = async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password)
        // onAuthStateChanged handles the rest
    }

    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider)
        const user = result.user
        const snap = await getDoc(doc(db, 'agents', user.uid))
        return { uid: user.uid, isNewUser: !snap.exists() }
    }

    const logout = async () => {
        await signOut(auth)
    }

    const completeOnboarding = async (form, uid) => {
        const marketAreas = Array.isArray(form.marketAreas)
            ? form.marketAreas
            : form.marketAreas.split(',').map(s => s.trim()).filter(Boolean)
        const nameParts = (form.name || '').trim().split(' ')
        const avatarInitials = nameParts.length >= 2
            ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
            : (nameParts[0]?.[0] ?? '?')

        const agentDoc = {
            uid,
            name: form.name,
            email: form.email,
            phone: form.phone,
            license: form.license,
            brokerage: form.brokerage,
            website: form.website,
            marketAreas,
            avatarInitials: avatarInitials.toUpperCase(),
            plan: 'free',
            credits: 20,
            creditMax: 20,
            memberSince: new Date().toISOString(),
            brandKit: {
                theme: form.theme ?? 'luxury-dark',
                captionTone: form.captionTone ?? 'professional',
                primaryColor: form.primaryColor ?? '#2bee79',
            },
        }

        await setDoc(doc(db, 'agents', uid), agentDoc)
        setAgent(agentDoc)
        setBrandKit(agentDoc.brandKit)
        setIsAuthenticated(true)
    }

    const deductCredits = (amount) => {
        setAgent(prev => ({
            ...prev,
            credits: Math.max(0, prev.credits - amount),
        }))
    }

    const addCredits = (amount) => {
        setAgent(prev => ({ ...prev, credits: prev.credits + amount }))
    }

    const updateBrandKit = (updates) => {
        setBrandKit(prev => ({ ...prev, ...updates }))
    }

    const addMarketArea = (market) => {
        setAgent(prev => {
            if (prev.marketAreas?.includes(market)) return prev
            return { ...prev, marketAreas: [...(prev.marketAreas ?? []), market] }
        })
    }

    const removeMarketArea = (market) => {
        setAgent(prev => ({
            ...prev,
            marketAreas: (prev.marketAreas ?? []).filter(m => m !== market),
        }))
    }

    const credits = agent?.credits ?? 0
    const creditMax = agent?.creditMax ?? 20
    const creditPercent = (credits / creditMax) * 100
    const isLowCredit = creditPercent <= 20
    const isOutOfCredits = credits === 0

    return (
        <AppContext.Provider value={{
            agent, setAgent,
            brandKit, setBrandKit, updateBrandKit,
            isAuthenticated,
            authLoading,
            deductCredits, addCredits,
            addMarketArea, removeMarketArea,
            login, loginWithGoogle, logout, completeOnboarding,
            creditPercent, isLowCredit, isOutOfCredits,
        }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const ctx = useContext(AppContext)
    if (!ctx) throw new Error('useApp must be used within AppProvider')
    return ctx
}

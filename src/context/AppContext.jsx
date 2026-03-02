import { createContext, useContext, useState } from 'react'
import { mockAgent, mockBrandKit } from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
    const [agent, setAgent] = useState(mockAgent)
    const [brandKit, setBrandKit] = useState(mockBrandKit)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [onboardingComplete, setOnboardingComplete] = useState(false)

    const deductCredits = (amount) => {
        setAgent(prev => ({
            ...prev,
            credits: Math.max(0, prev.credits - amount),
        }))
    }

    const addCredits = (amount) => {
        setAgent(prev => ({ ...prev, credits: prev.credits + amount }))
    }

    const login = () => {
        setIsAuthenticated(true)
        setOnboardingComplete(true)
    }

    const completeOnboarding = (agentData) => {
        setAgent(prev => ({ ...prev, ...agentData }))
        setIsAuthenticated(true)
        setOnboardingComplete(true)
    }

    const updateBrandKit = (updates) => {
        setBrandKit(prev => ({ ...prev, ...updates }))
    }

    const creditPercent = (agent.credits / agent.creditMax) * 100
    const isLowCredit = creditPercent <= 20
    const isOutOfCredits = agent.credits === 0

    return (
        <AppContext.Provider value={{
            agent, setAgent,
            brandKit, setBrandKit, updateBrandKit,
            isAuthenticated, setIsAuthenticated,
            onboardingComplete,
            deductCredits, addCredits,
            login, completeOnboarding,
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

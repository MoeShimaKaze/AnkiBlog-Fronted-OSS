// src/components/Layout/SimpleLayout.tsx
import React from 'react'
import Navbar from '@/components/Common/Navbar'

interface SimpleLayoutProps {
    children: React.ReactNode
}

const SimpleLayout: React.FC<SimpleLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen">
            <Navbar />
            {children}
        </div>
    )
}

export default SimpleLayout
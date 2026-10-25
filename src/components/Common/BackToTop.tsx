import React, { useState, useEffect } from 'react'
import { FloatButton } from 'antd'
import { VerticalAlignTopOutlined } from '@ant-design/icons'

const BackToTop: React.FC = () => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 300)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <FloatButton
            icon={<VerticalAlignTopOutlined />}
            onClick={scrollToTop}
            style={{ display: visible ? 'block' : 'none' }}
        />
    )
}

export default BackToTop
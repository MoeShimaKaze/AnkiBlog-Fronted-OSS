import React from 'react'
import { Button } from 'antd'
import { SunOutlined, MoonOutlined } from '@ant-design/icons'
import { useAppSelector, useAppDispatch } from '@/hooks/redux.ts'
import { toggleTheme } from '@/store/slices/themeSlice.ts'

const ThemeToggle: React.FC = () => {
    const { theme } = useAppSelector(state => state.theme)
    const dispatch = useAppDispatch()

    return (
        <Button
            type="text"
            icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
            onClick={() => dispatch(toggleTheme())}
        />
    )
}

export default ThemeToggle
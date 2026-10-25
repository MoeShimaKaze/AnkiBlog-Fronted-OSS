import { useState } from 'react'

export const useModal = (initialVisible = false) => {
    const [visible, setVisible] = useState(initialVisible)

    const show = () => setVisible(true)
    const hide = () => setVisible(false)
    const toggle = () => setVisible(!visible)

    return {
        visible,
        show,
        hide,
        toggle,
    }
}
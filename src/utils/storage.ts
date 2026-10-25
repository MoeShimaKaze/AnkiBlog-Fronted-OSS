export const storage = {
    set: (key: string, value: any) => {
        try {
            localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
            console.error('Storage set error:', error)
        }
    },

    get: <T = any>(key: string, defaultValue?: T): T | null => {
        try {
            const item = localStorage.getItem(key)
            return item ? JSON.parse(item) : defaultValue || null
        } catch (error) {
            console.error('Storage get error:', error)
            return defaultValue || null
        }
    },

    remove: (key: string) => {
        try {
            localStorage.removeItem(key)
        } catch (error) {
            console.error('Storage remove error:', error)
        }
    },

    clear: () => {
        try {
            localStorage.clear()
        } catch (error) {
            console.error('Storage clear error:', error)
        }
    }
}
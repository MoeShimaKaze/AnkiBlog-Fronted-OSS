import { useState } from 'react'
import { storage } from '@/utils/storage.ts'

export const useLocalStorage = <T>(key: string, initialValue: T) => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        const item = storage.get(key, initialValue)
        return item !== null ? item : initialValue
    })

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value
            setStoredValue(valueToStore)
            storage.set(key, valueToStore)
        } catch (error) {
            console.error('useLocalStorage setValue error:', error)
        }
    }

    return [storedValue, setValue] as const
}
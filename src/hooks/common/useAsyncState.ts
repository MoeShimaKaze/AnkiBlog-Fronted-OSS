// src/hooks/common/useAsyncState.ts
import { useState, useCallback } from 'react'

export interface AsyncState<T> {
    data: T | null
    loading: boolean
    error: Error | null
}

export const useAsyncState = <T>(initialData: T | null = null) => {
    const [state, setState] = useState<AsyncState<T>>({
        data: initialData,
        loading: false,
        error: null,
    })

    const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
        setState(prev => ({ ...prev, loading: true, error: null }))
        try {
            const data = await asyncFunction()
            setState({ data, loading: false, error: null })
            return data
        } catch (error) {
            setState(prev => ({ ...prev, loading: false, error: error as Error }))
            throw error
        }
    }, [])

    const reset = useCallback(() => {
        setState({ data: initialData, loading: false, error: null })
    }, [initialData])

    return {
        ...state,
        execute,
        reset,
    }
}

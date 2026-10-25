import { useState } from 'react'

export const usePagination = (initialPage = 1, initialPageSize = 10) => {
    const [current, setCurrent] = useState(initialPage)
    const [pageSize, setPageSize] = useState(initialPageSize)

    const handleChange = (page: number, size?: number) => {
        setCurrent(page)
        if (size && size !== pageSize) {
            setPageSize(size)
        }
    }

    const reset = () => {
        setCurrent(1)
    }

    return {
        current,
        pageSize,
        onChange: handleChange,
        reset,
        pagination: {
            current,
            pageSize,
            onChange: handleChange,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: [number, number]) =>
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
        },
    }
}
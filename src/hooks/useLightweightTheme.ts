// hooks/useLightweightTheme.ts
import { useState, useEffect, useCallback, useMemo } from 'react'

interface ThemeColors {
    primary: string
    secondary: string
    accent: string
    isDark: boolean
}

interface ThemeStyles {
    background: string
    cardBackground: string
    sidebarBackground: string
    surface: string
    textPrimary: string
    textSecondary: string
    overlay: string
    border: string
}

class LightweightColorExtractor {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D

    constructor() {
        this.canvas = document.createElement('canvas')
        this.ctx = this.canvas.getContext('2d')!
    }

    async extractColorsFromImage(imageUrl: string): Promise<ThemeColors> {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'

            img.onload = () => {
                try {
                    const colors = this.analyzeImage(img)
                    resolve(colors)
                } catch (error) {
                    reject(error)
                }
            }

            img.onerror = () => reject(new Error('图片加载失败'))
            img.src = imageUrl
        })
    }

    private analyzeImage(img: HTMLImageElement): ThemeColors {
        // 缩放图片提高性能
        const maxSize = 100
        const scale = Math.min(maxSize / img.width, maxSize / img.height)
        this.canvas.width = img.width * scale
        this.canvas.height = img.height * scale

        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
        const data = imageData.data

        const colorMap = new Map<string, number>()
        let totalBrightness = 0
        let pixelCount = 0

        // 采样分析
        for (let i = 0; i < data.length; i += 16) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            const a = data[i + 3]

            if (a < 128) continue

            const brightness = (r * 299 + g * 587 + b * 114) / 1000
            totalBrightness += brightness
            pixelCount++

            const quantized = this.quantizeColor(r, g, b)
            const key = `${quantized.r},${quantized.g},${quantized.b}`
            colorMap.set(key, (colorMap.get(key) || 0) + 1)
        }

        const avgBrightness = totalBrightness / pixelCount
        const isDark = avgBrightness < 128

        const sortedColors = Array.from(colorMap.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)

        const dominantColors = sortedColors.map(([key]) => {
            const [r, g, b] = key.split(',').map(Number)
            return { r, g, b }
        })

        return this.generateColorPalette(dominantColors, isDark)
    }

    private quantizeColor(r: number, g: number, b: number, levels: number = 4) {
        const factor = 255 / (levels - 1)
        return {
            r: Math.round(Math.round(r / factor) * factor),
            g: Math.round(Math.round(g / factor) * factor),
            b: Math.round(Math.round(b / factor) * factor)
        }
    }

    private generateColorPalette(colors: Array<{r: number, g: number, b: number}>, isDark: boolean): ThemeColors {
        if (colors.length === 0) {
            return {
                primary: '#667eea',
                secondary: '#764ba2',
                accent: '#f093fb',
                isDark: false
            }
        }

        const primaryColor = colors[0]
        const secondaryColor = this.shiftHue(primaryColor, 30)
        const accentColor = this.getComplementaryColor(primaryColor)

        return {
            primary: this.rgbToHex(primaryColor.r, primaryColor.g, primaryColor.b),
            secondary: this.rgbToHex(secondaryColor.r, secondaryColor.g, secondaryColor.b),
            accent: this.rgbToHex(accentColor.r, accentColor.g, accentColor.b),
            isDark
        }
    }

    private shiftHue(color: {r: number, g: number, b: number}, degrees: number) {
        const hsl = this.rgbToHsl(color.r, color.g, color.b)
        hsl.h = (hsl.h + degrees) % 360
        return this.hslToRgb(hsl.h, hsl.s, hsl.l)
    }

    private getComplementaryColor(color: {r: number, g: number, b: number}) {
        const hsl = this.rgbToHsl(color.r, color.g, color.b)
        hsl.h = (hsl.h + 180) % 360
        return this.hslToRgb(hsl.h, hsl.s, hsl.l)
    }

    private rgbToHsl(r: number, g: number, b: number) {
        r /= 255; g /= 255; b /= 255
        const max = Math.max(r, g, b), min = Math.min(r, g, b)
        let h = 0, s = 0
        const l = (max + min) / 2

        if (max !== min) {
            const d = max - min
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break
                case g: h = (b - r) / d + 2; break
                case b: h = (r - g) / d + 4; break
            }
            h /= 6
        }
        return { h: h * 360, s: s * 100, l: l * 100 }
    }

    private hslToRgb(h: number, s: number, l: number) {
        h /= 360; s /= 100; l /= 100
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1; if (t > 1) t -= 1
            if (t < 1/6) return p + (q - p) * 6 * t
            if (t < 1/2) return q
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
            return p
        }

        if (s === 0) {
            const gray = Math.round(l * 255)
            return { r: gray, g: gray, b: gray }
        }

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        return {
            r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
            g: Math.round(hue2rgb(p, q, h) * 255),
            b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
        }
    }

    private rgbToHex(r: number, g: number, b: number): string {
        return `#${[r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('')}`
    }
}

export const useLightweightTheme = () => {
    const [colors, setColors] = useState<ThemeColors>({
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#f093fb',
        isDark: false
    })
    const [isLoading, setIsLoading] = useState(false)

    const extractor = useMemo(() => new LightweightColorExtractor(), [])

    const updateThemeFromImage = useCallback(async (imageUrl: string) => {
        setIsLoading(true)
        try {
            const palette = await extractor.extractColorsFromImage(imageUrl)
            setColors(palette)
            localStorage.setItem('lightweight-theme', JSON.stringify(palette))
        } catch (error) {
            console.warn('主题提取失败:', error)
        } finally {
            setIsLoading(false)
        }
    }, [extractor])

    const styles = useMemo((): ThemeStyles => {
        const alpha = (opacity: number) => `${Math.round(opacity * 255).toString(16).padStart(2, '0')}`

        return {
            background: `${colors.primary}${alpha(0.4)}`,
            cardBackground: `${colors.isDark ? '#ffffff' : colors.primary}${alpha(0.15)}`,
            sidebarBackground: `${colors.secondary}${alpha(0.25)}`,
            surface: `${colors.isDark ? '#ffffff' : colors.primary}${alpha(0.1)}`,
            textPrimary: colors.isDark ? '#ffffff' : '#1a202c',
            textSecondary: `${colors.isDark ? '#ffffff' : '#1a202c'}${alpha(0.7)}`,
            overlay: `${colors.secondary}${alpha(0.3)}`,
            border: `${colors.primary}${alpha(0.3)}`
        }
    }, [colors])

    useEffect(() => {
        const cached = localStorage.getItem('lightweight-theme')
        if (cached) {
            try {
                setColors(JSON.parse(cached))
            } catch (error) {
                console.warn('恢复主题失败:', error)
            }
        }
    }, [])

    return { colors, styles, isLoading, updateThemeFromImage }
}
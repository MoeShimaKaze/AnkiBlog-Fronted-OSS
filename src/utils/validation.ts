export const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
}

export const validatePassword = (password: string) => {
    return password.length >= 6
}

export const validateUrl = (url: string) => {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

export const validateSlug = (slug: string) => {
    const re = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    return re.test(slug)
}

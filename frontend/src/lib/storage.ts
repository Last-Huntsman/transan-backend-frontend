const TOKEN_KEY = 'transan.access_token'

export const unauthorizedEvent = 'transan:unauthorized'

export const tokenStorage = {
  get() {
    if (typeof window === 'undefined') {
      return null
    }

    return window.localStorage.getItem(TOKEN_KEY)
  },
  set(token: string) {
    window.localStorage.setItem(TOKEN_KEY, token)
  },
  clear() {
    window.localStorage.removeItem(TOKEN_KEY)
  },
}

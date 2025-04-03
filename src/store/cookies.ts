export const saveToCookies = (key: string, value: string) => {
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/`
}

export const getFromCookies = (key: string) => {
  const cookies = document.cookie.split("; ")
  for (const cookie of cookies) {
    const [cookieKey, cookieValue] = cookie.split("=")
    if (cookieKey === key) {
      return decodeURIComponent(cookieValue)
    }
  }
  return ""
}

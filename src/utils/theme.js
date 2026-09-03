export function resolveTheme(storageKey, readStoredTheme, systemIsDark) {
  const storedTheme = readStoredTheme(storageKey)
  if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme
  return systemIsDark ? 'dark' : 'light'
}

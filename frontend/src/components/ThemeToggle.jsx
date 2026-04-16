import { useTheme } from '../theme/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? (
        <span className="theme-toggle-icon" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
              stroke="currentColor"
              strokeWidth="1.75"
            />
            <path
              d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </span>
      ) : (
        <span className="theme-toggle-icon" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 14.5A8.5 8.5 0 0 1 9.5 3 6.5 6.5 0 1 0 21 14.5Z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </button>
  )
}

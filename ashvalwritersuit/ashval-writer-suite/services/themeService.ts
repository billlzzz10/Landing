
class ThemeService {
    private THEME_KEY = 'ashval_theme';
    private DARK_CLASS = 'dark'; // Changed to 'dark' for Tailwind

    constructor() {
        this.initTheme();
    }

    private initTheme(): void {
        const savedTheme = localStorage.getItem(this.THEME_KEY);
        if (savedTheme === 'dark') {
            this.setDarkMode(true);
        } else if (savedTheme === 'light') {
            this.setDarkMode(false);
        } else {
            const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setDarkMode(prefersDarkMode);
        }
    }

    toggleTheme(): void {
        const isDarkMode = document.documentElement.classList.contains(this.DARK_CLASS);
        this.setDarkMode(!isDarkMode);
    }

    setDarkMode(isDark: boolean): void {
        if (isDark) {
            document.documentElement.classList.add(this.DARK_CLASS);
            localStorage.setItem(this.THEME_KEY, 'dark');
        } else {
            document.documentElement.classList.remove(this.DARK_CLASS);
            localStorage.setItem(this.THEME_KEY, 'light');
        }
    }

    isDarkMode(): boolean {
        return document.documentElement.classList.contains(this.DARK_CLASS);
    }
}

export default new ThemeService();

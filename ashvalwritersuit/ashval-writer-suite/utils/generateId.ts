
export function generateId(): string {
    // Using substring for broader compatibility, though substr works in modern browsers.
    return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 11)}`;
}

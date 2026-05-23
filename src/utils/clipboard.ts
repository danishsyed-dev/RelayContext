/**
 * Copy text to the system clipboard.
 * Falls back gracefully if clipboard access is unavailable.
 * Returns true if copy was successful, false otherwise.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        // Dynamic import to handle environments where clipboardy fails
        const { default: clipboardy } = await import("clipboardy");
        await clipboardy.write(text);
        return true;
    } catch {
        // Clipboard not available (headless, WSL, SSH, etc.)
        return false;
    }
}

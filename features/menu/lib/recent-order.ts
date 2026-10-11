const KEY = "web-menu-recent-order";

export function rememberOrder(id: string): void {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // Storage unavailable (private mode); ignore.
  }
}

export function getRecentOrder(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

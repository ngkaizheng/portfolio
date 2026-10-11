// Lets any button open the terminal easter egg (components/Terminal.tsx).
export const OPEN_TERMINAL = 'nkz:terminal'

export function openTerminal() {
  window.dispatchEvent(new Event(OPEN_TERMINAL))
}

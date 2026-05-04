export const COLS = [
  { key: 'bildnr',   label: 'Bildnr.',  width: 58  },
  { key: 'spieltag', label: 'Spieltag', width: 68  },
  { key: 'stimmung', label: 'Stimmung', width: 64  },
  { key: 'vorstopp', label: '★',        width: 22  },
  { key: 'seiten',   label: 'Seiten',   width: 46  },
  { key: 'dauer',    label: 'Dauer',    width: 64  },
  { key: 'motiv',    label: 'Motiv',    width: 152 },
  { key: 'synopsis', label: 'Synopsis', width: 310 },
  { key: 'rollen',   label: 'Rollen',   width: 120 },
  { key: 'notizen',  label: 'Notizen',  width: 118 },
  { key: 'sfx',      label: 'SFX',      width: 60  },
]

export const COLS_TEMPLATE = COLS.map((c) => `${c.width}px`).join(' ')
export const STRIP_WIDTH   = COLS.reduce((s, c) => s + c.width, 0) // ~1082px

export function hexToRgba(hex, alpha) {
  if (!hex || !hex.startsWith('#')) return `rgba(180,180,180,${alpha})`
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export function formatDauer(secs) {
  if (!secs && secs !== 0) return ''
  const m = Math.floor(secs / 60)
  const s = secs % 60
  if (m === 0) return `${s}"`
  return s === 0 ? `${m}'` : `${m}'${String(s).padStart(2, '0')}`
}

export function formatDauerLong(secs) {
  if (!secs) return '0:00'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
export function formatDate(iso) {
  if (!iso) return null
  const d = new Date(iso + 'T00:00:00')
  return `${WEEKDAYS[d.getDay()]}, ${d.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}`
}

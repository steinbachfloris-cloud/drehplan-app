import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const STATUS_LABEL = {
  offen: 'Offen',
  in_bearbeitung: 'In Bearb.',
  abgedreht: 'Abgedreht',
}

const STATUS_COLOR = {
  offen: 'bg-gray-700 text-gray-300',
  in_bearbeitung: 'bg-yellow-900/60 text-yellow-300',
  abgedreht: 'bg-green-900/60 text-green-300',
}

const MOOD_LABEL = {
  I: { label: 'INT', bg: 'bg-blue-900/50 text-blue-300' },
  A: { label: 'EXT', bg: 'bg-green-900/50 text-green-300' },
  T: { label: 'TAG', bg: 'bg-yellow-900/40 text-yellow-300' },
  N: { label: 'NACHT', bg: 'bg-indigo-900/50 text-indigo-300' },
}

export function SceneCardDisplay({ scene, isDragging, onClick, dragHandleProps, innerRef, style }) {
  const moods = (scene.stimmung || '').split('/').filter(Boolean)
  return (
    <div
      ref={innerRef}
      style={{ borderLeftColor: scene.farbe || '#3b82f6', ...style }}
      onClick={onClick}
      {...dragHandleProps}
      className={`
        group relative bg-dark-700 border border-dark-500 border-l-[3px] rounded-lg p-2.5
        cursor-grab active:cursor-grabbing select-none
        hover:border-dark-400 hover:bg-dark-600 transition-colors
        ${isDragging ? 'shadow-2xl rotate-1 scale-105' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          {scene.vorstopp && (
            <span className="shrink-0 text-accent text-xs font-bold leading-none" title="Vorstopp">★</span>
          )}
          <span className="font-bold text-white text-sm leading-tight truncate">
            {scene.bildnummer || '—'}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {moods.map((m) => {
            const md = MOOD_LABEL[m]
            return md ? (
              <span key={m} className={`text-[10px] font-semibold px-1 py-0.5 rounded ${md.bg}`}>{md.label}</span>
            ) : null
          })}
        </div>
      </div>
      {scene.synopsis && (
        <p className="text-gray-400 text-xs leading-snug line-clamp-2 mb-1.5">{scene.synopsis}</p>
      )}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${STATUS_COLOR[scene.status] || STATUS_COLOR.offen}`}>
          {STATUS_LABEL[scene.status] || scene.status}
        </span>
        {scene.seiten > 0 && <span className="text-[10px] text-gray-500">{scene.seiten}⅛</span>}
        {scene.dauer > 0 && <span className="text-[10px] text-gray-500">{scene.dauer}"</span>}
      </div>
    </div>
  )
}

export default function SceneCard({ scene, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={{ ...style, borderLeftColor: scene.farbe || '#3b82f6' }}
        className="h-16 rounded-lg bg-dark-500/30 border border-dark-400/30 border-l-[3px]"
      />
    )
  }

  return (
    <SceneCardDisplay
      scene={scene}
      innerRef={setNodeRef}
      style={style}
      dragHandleProps={{ ...attributes, ...listeners }}
      onClick={onClick}
    />
  )
}

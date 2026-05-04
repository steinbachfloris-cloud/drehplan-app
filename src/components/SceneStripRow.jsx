import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { COLS_TEMPLATE, hexToRgba, formatDauer } from '../utils/strip'
import useProjectStore from '../store/projectStore'

export function SceneStripDisplay({ scene, innerRef, style, dragProps, onEdit, isOverlay }) {
  const project = useProjectStore((s) => s.project)

  const getKürzel = (type, ids = []) => {
    const items = project.kategorien[type] || []
    return ids.map((id) => items.find((x) => x.id === id)?.kürzel).filter(Boolean).join(' ')
  }

  const bg = hexToRgba(scene.farbe || '#ffffff', 0.13)

  return (
    <div
      ref={innerRef}
      style={{
        gridTemplateColumns: COLS_TEMPLATE,
        backgroundColor: bg,
        borderLeftColor: scene.farbe || '#555',
        ...style,
      }}
      {...(dragProps || {})}
      onDoubleClick={onEdit}
      className={`
        grid border-b border-white/5 border-l-[3px] text-[11px] leading-none
        cursor-grab active:cursor-grabbing select-none
        hover:brightness-125 transition-[filter]
        ${isOverlay ? 'shadow-2xl ring-1 ring-white/20' : ''}
      `}
    >
      <Cell cls="font-bold text-white pl-3 py-[5px]">{scene.bildnummer || '—'}</Cell>
      <Cell cls="text-gray-400">{scene.spieltag || ''}</Cell>
      <Cell cls="text-gray-300 font-medium tracking-wide">{scene.stimmung || ''}</Cell>
      <Cell cls="text-accent text-center text-[10px]">{scene.vorstopp ? '★' : ''}</Cell>
      <Cell cls="text-gray-300 text-right pr-2 tabular-nums">{scene.seiten > 0 ? `${scene.seiten}⅛` : ''}</Cell>
      <Cell cls="text-gray-400 tabular-nums">{formatDauer(scene.dauer)}</Cell>
      <Cell cls="text-gray-300 truncate">{getKürzel('motive', scene.motive)}</Cell>
      <Cell cls="text-gray-200 truncate pr-2">{scene.synopsis || ''}</Cell>
      <Cell cls="text-gray-400 truncate">{getKürzel('rollen', scene.rollen)}</Cell>
      <Cell cls="text-gray-500 truncate">{scene.notizen || ''}</Cell>
      <Cell cls="text-gray-400 truncate">{getKürzel('sfx', scene.sfx)}</Cell>
    </div>
  )
}

export default function SceneStripRow({ scene, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: scene.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={{
          ...style,
          height: 28,
          borderLeftColor: scene.farbe || '#555',
          backgroundColor: hexToRgba(scene.farbe || '#ffffff', 0.06),
        }}
        className="border-b border-white/5 border-l-[3px] opacity-50"
      />
    )
  }

  return (
    <SceneStripDisplay
      scene={scene}
      innerRef={setNodeRef}
      style={style}
      dragProps={{ ...attributes, ...listeners }}
      onEdit={onEdit}
    />
  )
}

function Cell({ children, cls }) {
  return (
    <div className={`flex items-center min-w-0 px-1.5 py-[5px] ${cls || ''}`}>
      <span className="truncate w-full">{children}</span>
    </div>
  )
}

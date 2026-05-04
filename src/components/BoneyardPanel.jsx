import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { hexToRgba } from '../utils/strip'
import useProjectStore from '../store/projectStore'

function BoneyardStrip({ scene, onEdit }) {
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
        style={{ ...style, borderLeftColor: scene.farbe || '#555', height: 26 }}
        className="border-b border-white/5 border-l-[3px] opacity-40"
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        gridTemplateColumns: '44px 44px 1fr',
        backgroundColor: hexToRgba(scene.farbe || '#ffffff', 0.12),
        borderLeftColor: scene.farbe || '#555',
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      onDoubleClick={() => onEdit(scene.id)}
      className="
        grid border-b border-white/5 border-l-[3px] text-[11px]
        cursor-grab active:cursor-grabbing select-none
        hover:brightness-125 transition-[filter]
      "
    >
      <div className="px-2 py-[5px] font-bold text-white truncate">{scene.bildnummer || '—'}</div>
      <div className="px-1 py-[5px] text-gray-400 truncate text-[10px]">{scene.stimmung || ''}</div>
      <div className="px-1 py-[5px] text-gray-300 truncate">{scene.synopsis || ''}</div>
    </div>
  )
}

export default function BoneyardPanel({ onEditScene, onClose }) {
  const project = useProjectStore((s) => s.project)
  const { setNodeRef, isOver } = useDroppable({ id: 'boneyard' })

  const scenes = project.boneyardIds.map((id) => project.szenen[id]).filter(Boolean)

  return (
    <aside
      className={`
        w-52 shrink-0 flex flex-col border-r-2 border-dark-600
        transition-colors
        ${isOver ? 'bg-dark-700' : 'bg-dark-800'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b-2 border-dark-600 bg-[#141824]">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Nicht Disponiert
          </span>
          <span className="ml-1.5 text-[10px] text-gray-600">({scenes.length})</span>
        </div>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-400 text-xs leading-none">✕</button>
      </div>

      {/* Column header */}
      <div
        className="grid text-[9px] font-semibold text-gray-600 uppercase tracking-wider border-b border-dark-600 bg-dark-800"
        style={{ gridTemplateColumns: '44px 44px 1fr' }}
      >
        <div className="px-2 py-1">Nr.</div>
        <div className="px-1 py-1">Stmg.</div>
        <div className="px-1 py-1">Synopsis</div>
      </div>

      {/* Scene list */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto min-h-0">
        <SortableContext items={project.boneyardIds} strategy={verticalListSortingStrategy}>
          {scenes.map((scene) => (
            <BoneyardStrip key={scene.id} scene={scene} onEdit={onEditScene} />
          ))}
        </SortableContext>

        {scenes.length === 0 && (
          <div className="py-8 text-center text-[11px] text-gray-700 px-3">
            Alle Szenen disponiert
          </div>
        )}
      </div>
    </aside>
  )
}

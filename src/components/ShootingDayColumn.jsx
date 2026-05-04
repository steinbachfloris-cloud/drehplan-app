import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import useProjectStore from '../store/projectStore'
import SceneCard from './SceneCard'

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

export default function ShootingDayColumn({ day, onEditScene }) {
  const project = useProjectStore((s) => s.project)
  const updateShootingDay = useProjectStore((s) => s.updateShootingDay)
  const deleteShootingDay = useProjectStore((s) => s.deleteShootingDay)
  const [showMenu, setShowMenu] = useState(false)

  const { setNodeRef, isOver } = useDroppable({ id: day.id })

  const scenes = day.szenenIds.map((id) => project.szenen[id]).filter(Boolean)
  const totalSeiten = scenes.reduce((sum, s) => sum + (s.seiten || 0), 0)
  const totalDauer = scenes.reduce((sum, s) => sum + (s.dauer || 0), 0)

  const dateObj = day.datum ? new Date(day.datum + 'T00:00:00') : null
  const dateStr = dateObj
    ? `${WEEKDAYS[dateObj.getDay()]}, ${dateObj.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}`
    : null

  return (
    <div className={`
      w-52 shrink-0 flex flex-col rounded-xl border transition-colors
      ${isOver ? 'border-accent/60 bg-dark-700' : 'border-dark-600 bg-dark-800'}
    `}>
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-dark-600">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-bold text-accent uppercase tracking-wider">
                DT {day.nummer}
              </span>
              {dateStr && (
                <span className="text-xs text-gray-400">{dateStr}</span>
              )}
            </div>

            {/* Editable date */}
            {!project.startdatum && (
              <input
                type="date"
                className="mt-1 bg-transparent border-b border-dark-500 text-xs text-gray-400 w-full focus:outline-none focus:border-accent"
                value={day.datum || ''}
                onChange={(e) => updateShootingDay(day.id, { datum: e.target.value || null })}
              />
            )}

            {/* Time */}
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] text-gray-600">Drehbeginn:</span>
              <input
                type="time"
                className="bg-transparent text-[10px] text-gray-500 focus:outline-none focus:text-gray-300 w-14"
                value={day.drehbeginn || '07:00'}
                onChange={(e) => updateShootingDay(day.id, { drehbeginn: e.target.value })}
              />
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="text-gray-600 hover:text-gray-300 p-0.5 rounded transition-colors"
            >
              <DotsIcon className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-6 z-50 bg-dark-700 border border-dark-500 rounded-lg shadow-xl w-36 py-1">
                <button
                  onClick={() => { deleteShootingDay(day.id); setShowMenu(false) }}
                  className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-dark-600"
                >
                  Drehtag löschen
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {scenes.length > 0 && (
          <div className="text-[10px] text-gray-600 mt-1">
            {scenes.length} Sz. · {totalSeiten}⅛ · {totalDauer}"
          </div>
        )}
      </div>

      {/* Scene list */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-[80px]">
        <SortableContext items={day.szenenIds} strategy={verticalListSortingStrategy}>
          {scenes.map((scene) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              onClick={() => onEditScene(scene.id)}
            />
          ))}
        </SortableContext>

        {scenes.length === 0 && isOver && (
          <div className="h-12 border-2 border-dashed border-accent/40 rounded-lg" />
        )}
      </div>
    </div>
  )
}

function DotsIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  )
}

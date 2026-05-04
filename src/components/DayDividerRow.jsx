import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { COLS_TEMPLATE, formatDate, formatDauerLong } from '../utils/strip'
import useProjectStore from '../store/projectStore'

export default function DayDividerRow({ day }) {
  const project = useProjectStore((s) => s.project)
  const updateShootingDay = useProjectStore((s) => s.updateShootingDay)
  const deleteShootingDay = useProjectStore((s) => s.deleteShootingDay)
  const [menu, setMenu] = useState(false)

  const { setNodeRef, isOver } = useDroppable({ id: day.id })

  const scenes = day.szenenIds.map((id) => project.szenen[id]).filter(Boolean)
  const totalDauer = scenes.reduce((s, sc) => s + (sc.dauer || 0), 0)
  const totalSeiten = scenes.reduce((s, sc) => s + (sc.seiten || 0), 0)
  const dateStr = formatDate(day.datum)

  return (
    <div
      ref={setNodeRef}
      className={`
        flex items-stretch border-b-2 border-dark-900 select-none group
        ${isOver ? 'bg-[#1e2540]' : 'bg-[#141824]'}
        transition-colors
      `}
      style={{ minHeight: 34 }}
    >
      {/* Day number + stats */}
      <div
        className="flex items-center gap-4 px-3 py-1.5 flex-1 cursor-default"
        style={{ gridTemplateColumns: COLS_TEMPLATE }}
      >
        <span className="font-black text-accent tracking-widest text-sm shrink-0">
          {day.nummer}.DT
        </span>

        {/* Totals */}
        <div className="flex items-center gap-3 text-[11px] shrink-0">
          {totalSeiten > 0 && (
            <span className="text-gray-300 tabular-nums">{totalSeiten}⅛</span>
          )}
          {totalDauer > 0 && (
            <span className="text-gray-300 tabular-nums">{formatDauerLong(totalDauer)}</span>
          )}
        </div>

        {/* Date */}
        <div className="flex items-center gap-3 text-[11px]">
          {!project.startdatum && (
            <input
              type="date"
              className="bg-transparent border-b border-dark-500 text-gray-300 text-[11px] focus:outline-none focus:border-accent w-28"
              value={day.datum || ''}
              onChange={(e) => updateShootingDay(day.id, { datum: e.target.value || null })}
            />
          )}
          {dateStr && (
            <span className="text-gray-200 font-medium">{dateStr}</span>
          )}
          <span className="text-gray-500">
            {day.drehbeginn && `(${day.drehbeginn})`}
          </span>
          <input
            type="time"
            className="bg-transparent text-gray-500 text-[10px] focus:outline-none focus:text-gray-300 w-12"
            value={day.drehbeginn || '07:00'}
            onChange={(e) => updateShootingDay(day.id, { drehbeginn: e.target.value })}
          />
        </div>
      </div>

      {/* Menu */}
      <div className="relative flex items-center px-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setMenu((v) => !v)}
          className="text-gray-600 hover:text-gray-300 px-1 text-sm leading-none"
        >
          ···
        </button>
        {menu && (
          <div className="absolute right-6 top-0 z-50 bg-dark-700 border border-dark-500 rounded-lg shadow-xl w-40 py-1">
            <button
              className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-dark-600"
              onClick={() => { deleteShootingDay(day.id); setMenu(false) }}
            >
              Drehtag löschen
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

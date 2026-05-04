import { useState, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import useProjectStore from '../store/projectStore'
import BoneyardPanel from './BoneyardPanel'
import DayDividerRow from './DayDividerRow'
import SceneStripRow, { SceneStripDisplay } from './SceneStripRow'
import SceneEditor from './SceneEditor'
import ProjectHeader from './ProjectHeader'
import { COLS, COLS_TEMPLATE, STRIP_WIDTH } from '../utils/strip'

function EmptyDayZone({ dayId }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'empty-' + dayId })
  return (
    <div
      ref={setNodeRef}
      className={`h-14 border-b border-white/5 transition-colors ${isOver ? 'bg-accent/10' : ''}`}
    />
  )
}

export default function Board() {
  const project = useProjectStore((s) => s.project)
  const addShootingDay = useProjectStore((s) => s.addShootingDay)
  const moveSceneToDay = useProjectStore((s) => s.moveSceneToDay)
  const moveSceneToBoneyard = useProjectStore((s) => s.moveSceneToBoneyard)
  const reorderBoneyard = useProjectStore((s) => s.reorderBoneyard)

  const [activeSceneId, setActiveSceneId] = useState(null)
  const [editingSceneId, setEditingSceneId] = useState(null)
  const [creatingScene, setCreatingScene] = useState(false)
  const [boneyardOpen, setBoneyardOpen] = useState(true)

  const dragSourceRef = useRef(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  const findContainer = (id) => {
    if (project.boneyardIds.includes(id)) return 'boneyard'
    for (const day of project.drehtage) {
      if (day.szenenIds.includes(id)) return day.id
    }
    return null
  }

  const handleDragStart = ({ active }) => {
    setActiveSceneId(active.id)
    dragSourceRef.current = findContainer(active.id)
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveSceneId(null)
    if (!over) return

    const sceneId = active.id
    const overId = over.id
    const source = dragSourceRef.current

    // Handle drop onto empty-day zone
    if (typeof overId === 'string' && overId.startsWith('empty-')) {
      const dayId = overId.slice(6)
      moveSceneToDay(sceneId, dayId, undefined, source === 'boneyard' ? null : source)
      return
    }

    const overIsBoneyard = overId === 'boneyard' || project.boneyardIds.includes(overId)
    const targetDay = project.drehtage.find(
      (d) => d.id === overId || d.szenenIds.includes(overId)
    )

    if (overIsBoneyard) {
      if (source !== 'boneyard') {
        moveSceneToBoneyard(sceneId, source)
      } else if (project.boneyardIds.includes(overId) && overId !== sceneId) {
        reorderBoneyard(sceneId, overId)
      }
    } else if (targetDay) {
      const toIndex = targetDay.szenenIds.includes(overId)
        ? targetDay.szenenIds.indexOf(overId)
        : undefined
      moveSceneToDay(
        sceneId,
        targetDay.id,
        toIndex,
        source === 'boneyard' ? null : source
      )
    }
  }

  const activeScene = activeSceneId ? project.szenen[activeSceneId] : null

  // All scenes across all days for global allSceneIds (needed for SortableContext)
  const allDaySceneIds = project.drehtage.flatMap((d) => d.szenenIds)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-dark-900">
      <ProjectHeader onAddScene={() => setCreatingScene(true)} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 overflow-hidden">
          {/* Boneyard panel */}
          {boneyardOpen ? (
            <BoneyardPanel
              onEditScene={setEditingSceneId}
              onClose={() => setBoneyardOpen(false)}
            />
          ) : (
            <button
              onClick={() => setBoneyardOpen(true)}
              className="w-7 shrink-0 bg-dark-800 border-r-2 border-dark-600 text-gray-600 hover:text-accent text-[9px] font-bold uppercase tracking-widest hover:bg-dark-700 transition-colors"
              style={{ writingMode: 'vertical-rl', letterSpacing: '0.15em' }}
            >
              Boneyard ({project.boneyardIds.length})
            </button>
          )}

          {/* Main stripboard */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Sticky column header */}
            <div
              className="shrink-0 border-b-2 border-dark-600 bg-[#141824]"
              style={{ minWidth: STRIP_WIDTH }}
            >
              <div
                className="grid text-[9px] font-bold text-gray-500 uppercase tracking-widest"
                style={{ gridTemplateColumns: COLS_TEMPLATE }}
              >
                {COLS.map((col, i) => (
                  <div
                    key={col.key}
                    className={`px-2 py-2 ${i === 3 ? 'text-center' : ''} ${i === 4 ? 'text-right pr-2' : ''}`}
                  >
                    {col.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Scrollable strip area */}
            <div className="flex-1 overflow-y-auto overflow-x-auto">
              <div style={{ minWidth: STRIP_WIDTH }}>
                {project.drehtage.map((day) => (
                  <div key={day.id}>
                    <DayDividerRow day={day} />
                    <SortableContext
                      items={day.szenenIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {day.szenenIds.map((id) => {
                        const scene = project.szenen[id]
                        if (!scene) return null
                        return (
                          <SceneStripRow
                            key={id}
                            scene={scene}
                            dayId={day.id}
                            onEdit={() => setEditingSceneId(id)}
                          />
                        )
                      })}
                    </SortableContext>

                    {/* Always-present empty drop zone at bottom of day */}
                    <EmptyDayZone dayId={day.id} />
                  </div>
                ))}

                {/* Add shooting day */}
                <button
                  onClick={addShootingDay}
                  className="w-full py-3 text-[11px] text-gray-700 hover:text-accent hover:bg-dark-800/40 transition-colors border-t border-dark-700/50 flex items-center justify-center gap-1.5"
                >
                  <span className="text-base leading-none">+</span>
                  Drehtag hinzufügen
                </button>
              </div>
            </div>
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeScene && (
            <div style={{ width: STRIP_WIDTH }}>
              <SceneStripDisplay scene={activeScene} isOverlay />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {(editingSceneId || creatingScene) && (
        <SceneEditor
          sceneId={editingSceneId}
          onClose={() => {
            setEditingSceneId(null)
            setCreatingScene(false)
          }}
        />
      )}
    </div>
  )
}

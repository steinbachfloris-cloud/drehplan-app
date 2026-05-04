import { useState, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import useProjectStore from '../store/projectStore'
import Boneyard from './Boneyard'
import ShootingDayColumn from './ShootingDayColumn'
import SceneCard, { SceneCardDisplay } from './SceneCard'
import SceneEditor from './SceneEditor'
import ProjectHeader from './ProjectHeader'

export default function Board() {
  const project = useProjectStore((s) => s.project)
  const addShootingDay = useProjectStore((s) => s.addShootingDay)
  const moveSceneToDay = useProjectStore((s) => s.moveSceneToDay)
  const moveSceneToBoneyard = useProjectStore((s) => s.moveSceneToBoneyard)
  const reorderBoneyard = useProjectStore((s) => s.reorderBoneyard)

  const [activeSceneId, setActiveSceneId] = useState(null)
  const [editingSceneId, setEditingSceneId] = useState(null)
  const [creatingScene, setCreatingScene] = useState(false)

  const dragSourceRef = useRef(null) // { type: 'boneyard' | 'day', dayId? }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
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

    // Dropping onto a day column or scene within a day
    const targetDay = project.drehtage.find(
      (d) => d.id === overId || d.szenenIds.includes(overId)
    )

    if (overId === 'boneyard' || project.boneyardIds.includes(overId)) {
      if (source !== 'boneyard') {
        moveSceneToBoneyard(sceneId, source)
      } else {
        reorderBoneyard(sceneId, overId)
      }
    } else if (targetDay) {
      const toIndex = targetDay.szenenIds.includes(overId)
        ? targetDay.szenenIds.indexOf(overId)
        : undefined
      moveSceneToDay(sceneId, targetDay.id, toIndex, source === 'boneyard' ? null : source)
    }
  }

  const activeScene = activeSceneId ? project.szenen[activeSceneId] : null

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ProjectHeader onAddScene={() => setCreatingScene(true)} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 overflow-hidden">
          {/* Boneyard – left panel */}
          <Boneyard onEditScene={setEditingSceneId} />

          {/* Shooting days – scrollable horizontally */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-3 h-full p-3 min-w-max">
              {project.drehtage.map((day) => (
                <ShootingDayColumn
                  key={day.id}
                  day={day}
                  onEditScene={setEditingSceneId}
                />
              ))}

              {/* Add day button */}
              <div className="flex items-start pt-1">
                <button
                  onClick={addShootingDay}
                  className="w-52 h-14 border-2 border-dashed border-dark-500 hover:border-accent/60 rounded-xl text-gray-500 hover:text-accent text-sm font-medium transition-colors flex items-center justify-center gap-2 shrink-0"
                >
                  <span className="text-lg leading-none">+</span>
                  Drehtag hinzufügen
                </button>
              </div>
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeScene && (
            <div className="w-52">
              <SceneCardDisplay scene={activeScene} isDragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {(editingSceneId || creatingScene) && (
        <SceneEditor
          sceneId={editingSceneId}
          onClose={() => { setEditingSceneId(null); setCreatingScene(false) }}
        />
      )}
    </div>
  )
}

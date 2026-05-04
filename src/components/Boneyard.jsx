import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import useProjectStore from '../store/projectStore'
import SceneCard from './SceneCard'

export default function Boneyard({ onEditScene }) {
  const project = useProjectStore((s) => s.project)
  const { setNodeRef, isOver } = useDroppable({ id: 'boneyard' })

  const scenes = project.boneyardIds
    .map((id) => project.szenen[id])
    .filter(Boolean)

  const totalSeiten = scenes.reduce((sum, s) => sum + (s.seiten || 0), 0)
  const totalDauer = scenes.reduce((sum, s) => sum + (s.dauer || 0), 0)

  return (
    <aside className={`
      w-56 shrink-0 flex flex-col border-r border-dark-600 bg-dark-800 transition-colors
      ${isOver ? 'bg-dark-700' : ''}
    `}>
      <div className="px-3 py-2.5 border-b border-dark-600">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Boneyard</h2>
          <span className="text-xs text-gray-600">{scenes.length}</span>
        </div>
        {scenes.length > 0 && (
          <div className="text-[10px] text-gray-600 mt-0.5">
            {totalSeiten}⅛ · {totalDauer}"
          </div>
        )}
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0"
      >
        <SortableContext items={project.boneyardIds} strategy={verticalListSortingStrategy}>
          {scenes.map((scene) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              onClick={() => onEditScene(scene.id)}
            />
          ))}
        </SortableContext>

        {scenes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-700 text-xs text-center px-2">
            <p>Nicht disponierte Szenen</p>
            <p className="mt-1">Szenen hierher ziehen</p>
          </div>
        )}
      </div>
    </aside>
  )
}

import { useState } from 'react'
import useProjectStore from '../store/projectStore'
import ScriptImport from './ScriptImport'

export default function ProjectHeader({ onAddScene }) {
  const project = useProjectStore((s) => s.project)
  const isDirty = useProjectStore((s) => s.isDirty)
  const updateProjectName = useProjectStore((s) => s.updateProjectName)
  const setStartdatum = useProjectStore((s) => s.setStartdatum)
  const getProjectJSON = useProjectStore((s) => s.getProjectJSON)
  const closeProject = useProjectStore((s) => s.closeProject)

  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(project.name)
  const [showImport, setShowImport] = useState(false)

  const handleSave = () => {
    const json = getProjectJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name.replace(/\s+/g, '_')}_drehplan.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleNameSave = () => {
    updateProjectName(nameVal.trim() || project.name)
    setEditingName(false)
  }

  return (
    <>
      <header className="flex items-center gap-3 px-4 py-2.5 bg-dark-800 border-b border-dark-600 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="7" width="20" height="15" rx="2" />
            <path d="M2 7l20 0M7 7L5 2M12 7L10 2M17 7L15 2M2 7l3-5" strokeLinecap="round" />
          </svg>
          <span className="font-bold text-white text-sm tracking-wide hidden sm:block">DREHPLAN</span>
        </div>

        <div className="h-5 w-px bg-dark-500" />

        {/* Project name */}
        {editingName ? (
          <input
            className="input py-1 text-sm font-semibold"
            value={nameVal}
            autoFocus
            onChange={(e) => setNameVal(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameSave()
              if (e.key === 'Escape') setEditingName(false)
            }}
          />
        ) : (
          <button
            onClick={() => { setNameVal(project.name); setEditingName(true) }}
            className="text-sm font-semibold text-white hover:text-accent transition-colors flex items-center gap-1.5"
          >
            {project.name}
            {isDirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" title="Ungespeicherte Änderungen" />
            )}
          </button>
        )}

        <div className="flex-1" />

        {/* Start date */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 hidden md:block">Startdatum:</label>
          <input
            type="date"
            className="input py-1 text-xs"
            value={project.startdatum || ''}
            onChange={(e) => setStartdatum(e.target.value || null)}
          />
        </div>

        <div className="h-5 w-px bg-dark-500" />

        {/* KI Import */}
        <button
          onClick={() => setShowImport(true)}
          className="flex items-center gap-1.5 bg-dark-600 hover:bg-dark-500 border border-accent/30 hover:border-accent/60 text-accent text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          title="Drehbuch per KI importieren"
        >
          <SparkleIcon className="w-4 h-4" />
          KI-Import
        </button>

        {/* Manual scene */}
        <button
          onClick={onAddScene}
          className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1.5"
        >
          <span className="text-base leading-none">+</span>
          Szene
        </button>

        <button
          onClick={handleSave}
          className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-1.5"
        >
          <SaveIcon className="w-4 h-4" />
          Speichern
        </button>

        <button
          onClick={() => {
            if (isDirty && !window.confirm('Ungespeicherte Änderungen gehen verloren. Fortfahren?')) return
            closeProject()
          }}
          className="btn-ghost py-1.5 text-sm"
        >
          Schließen
        </button>
      </header>

      {showImport && <ScriptImport onClose={() => setShowImport(false)} />}
    </>
  )
}

function SparkleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 16l.75 2.25L22 19l-2.25.75L19 22l-.75-2.25L16 19l2.25-.75L19 16z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SaveIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="17,21 17,13 7,13 7,21" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="7,3 7,8 15,8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

import { useState, useRef } from 'react'
import useProjectStore from '../store/projectStore'

export default function HomePage() {
  const [projectName, setProjectName] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef()
  const newProject = useProjectStore((s) => s.newProject)
  const loadProject = useProjectStore((s) => s.loadProject)

  const handleCreate = () => {
    const name = projectName.trim() || 'Unbenanntes Projekt'
    newProject(name)
  }

  const handleLoad = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!data.szenen || !data.drehtage) throw new Error('Ungültiges Format')
        loadProject(data)
      } catch {
        setError('Datei konnte nicht geladen werden. Ungültiges Drehplan-Format.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Logo / Header */}
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <ClapperIcon className="w-10 h-10 text-accent" />
          <h1 className="text-4xl font-bold tracking-tight text-white">Drehplan</h1>
        </div>
        <p className="text-gray-400 text-sm tracking-widest uppercase">Produktions-Disposition</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        {/* New project */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Neues Projekt</h2>
          <div>
            <label className="label mb-1.5 block">Projektname</label>
            <input
              className="input w-full"
              placeholder="z.B. Spielfilm 2025"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <button onClick={handleCreate} className="btn-primary w-full">
            Projekt erstellen
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-dark-500" />
          <span className="text-gray-600 text-sm">oder</span>
          <div className="flex-1 h-px bg-dark-500" />
        </div>

        {/* Load project */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Projekt laden</h2>
          <p className="text-gray-400 text-sm">Bestehende .json-Datei öffnen</p>
          {error && (
            <p className="text-red-400 text-sm bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            onClick={() => { setError(''); fileRef.current.click() }}
            className="btn-secondary w-full"
          >
            Datei auswählen…
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleLoad}
          />
        </div>
      </div>

      <p className="mt-12 text-gray-700 text-xs">Version 0.1 · Drehplan App</p>
    </div>
  )
}

function ClapperIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="7" width="20" height="15" rx="2" />
      <path d="M2 7l20 0" strokeLinecap="round" />
      <path d="M7 7L5 2" strokeLinecap="round" />
      <path d="M12 7L10 2" strokeLinecap="round" />
      <path d="M17 7L15 2" strokeLinecap="round" />
      <path d="M2 7l3-5" strokeLinecap="round" />
    </svg>
  )
}

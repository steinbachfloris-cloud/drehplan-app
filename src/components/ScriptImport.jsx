import { useState, useRef, useCallback } from 'react'
import { extractScenesFromPDF } from '../services/claudeApi'
import useProjectStore from '../store/projectStore'

const STEP = { IDLE: 'idle', READING: 'reading', ANALYZING: 'analyzing', PREVIEW: 'preview', DONE: 'done' }

export default function ScriptImport({ onClose }) {
  const importScenes = useProjectStore((s) => s.importScenes)

  const [step, setStep] = useState(STEP.IDLE)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [scenes, setScenes] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef()

  const processFile = useCallback(async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Bitte eine PDF-Datei auswählen.')
      return
    }
    setError('')
    setStep(STEP.READING)
    setStatus('PDF wird gelesen…')

    try {
      // Read PDF as base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      setStep(STEP.ANALYZING)
      setStatus('Claude analysiert das Drehbuch…')

      const extracted = await extractScenesFromPDF(base64, setStatus)

      setScenes(extracted)
      setSelected(new Set(extracted.map((_, i) => i)))
      setStep(STEP.PREVIEW)
    } catch (err) {
      setError(err.message || 'Unbekannter Fehler')
      setStep(STEP.IDLE)
    }
  }, [])

  const handleFile = (e) => processFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  const toggleAll = () => {
    if (selected.size === scenes.length) setSelected(new Set())
    else setSelected(new Set(scenes.map((_, i) => i)))
  }

  const toggle = (i) => {
    const next = new Set(selected)
    next.has(i) ? next.delete(i) : next.add(i)
    setSelected(next)
  }

  const handleImport = () => {
    const toImport = scenes.filter((_, i) => selected.has(i))
    importScenes(toImport)
    setStep(STEP.DONE)
  }

  const selectedCount = selected.size

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-500 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600 shrink-0">
          <div className="flex items-center gap-3">
            <AiIcon className="w-5 h-5 text-accent" />
            <h2 className="font-semibold text-white text-lg">Drehbuch importieren</h2>
            <span className="text-xs text-gray-500 bg-dark-600 px-2 py-0.5 rounded-full">KI-gestützt</span>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">

          {/* Step: IDLE or ERROR */}
          {(step === STEP.IDLE) && (
            <div>
              <p className="text-sm text-gray-400 mb-5">
                Lade ein Drehbuch als PDF hoch. Claude extrahiert automatisch alle Szenen
                mit Bildnummer, Motiv, Stimmung, Synopsis und Rollen.
              </p>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current.click()}
                className={`
                  border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
                  ${dragging
                    ? 'border-accent bg-accent/10'
                    : 'border-dark-500 hover:border-accent/50 hover:bg-dark-700/50'}
                `}
              >
                <UploadIcon className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-300 font-medium">PDF hier ablegen oder klicken</p>
                <p className="text-gray-600 text-sm mt-1">Nur PDF-Dateien · Max. empfohlen: 50 MB</p>
              </div>
              <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
              {error && (
                <div className="mt-4 text-sm text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg px-4 py-3">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step: READING or ANALYZING */}
          {(step === STEP.READING || step === STEP.ANALYZING) && (
            <div className="flex flex-col items-center justify-center py-16 gap-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-dark-500 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-accent rounded-full animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium">{status}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {step === STEP.ANALYZING
                    ? 'Claude liest das gesamte Drehbuch — das kann 10–30 Sekunden dauern.'
                    : 'Datei wird vorbereitet…'}
                </p>
              </div>
            </div>
          )}

          {/* Step: PREVIEW */}
          {step === STEP.PREVIEW && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-400">
                  <span className="text-white font-semibold">{scenes.length} Szenen</span> erkannt ·{' '}
                  <span className="text-accent">{selectedCount} ausgewählt</span>
                </p>
                <button onClick={toggleAll} className="btn-ghost text-xs px-2 py-1">
                  {selected.size === scenes.length ? 'Alle abwählen' : 'Alle auswählen'}
                </button>
              </div>

              <div className="border border-dark-600 rounded-xl overflow-hidden">
                {/* Table header */}
                <div className="grid text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-dark-900 px-3 py-2 border-b border-dark-700"
                  style={{ gridTemplateColumns: '28px 52px 90px 60px 1fr 130px' }}>
                  <div />
                  <div>Bildnr.</div>
                  <div>Motiv</div>
                  <div>Stimmung</div>
                  <div>Synopsis</div>
                  <div>Rollen</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-dark-700 max-h-80 overflow-y-auto">
                  {scenes.map((scene, i) => (
                    <div
                      key={i}
                      onClick={() => toggle(i)}
                      className={`grid items-center px-3 py-2 cursor-pointer text-xs transition-colors
                        ${selected.has(i) ? 'bg-dark-700' : 'bg-dark-800 opacity-50'}`}
                      style={{ gridTemplateColumns: '28px 52px 90px 60px 1fr 130px' }}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(i)}
                        onChange={() => toggle(i)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-3.5 h-3.5 accent-amber-400"
                      />
                      <span className="font-bold text-white">{scene.bildnummer || '—'}</span>
                      <span className="text-gray-300 truncate pr-2">{scene.motiv || ''}</span>
                      <span className="text-gray-400">{scene.stimmung || ''}</span>
                      <span className="text-gray-300 truncate pr-2">{scene.synopsis || ''}</span>
                      <span className="text-gray-500 truncate">
                        {(scene.rollen || []).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mt-3 text-sm text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg px-4 py-3">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step: DONE */}
          {step === STEP.DONE && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-green-900/40 border border-green-700/50 flex items-center justify-center">
                <CheckIcon className="w-7 h-7 text-green-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{selectedCount} Szenen importiert</p>
                <p className="text-gray-500 text-sm mt-1">Alle Szenen sind jetzt im Boneyard verfügbar.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-dark-600 shrink-0">
          <div className="text-xs text-gray-600">
            {step === STEP.PREVIEW && `${scenes.length} Szenen erkannt`}
          </div>
          <div className="flex gap-3">
            {step === STEP.DONE ? (
              <button onClick={onClose} className="btn-primary">Schließen</button>
            ) : (
              <>
                <button onClick={onClose} className="btn-secondary" disabled={step === STEP.ANALYZING || step === STEP.READING}>
                  Abbrechen
                </button>
                {step === STEP.PREVIEW && (
                  <button
                    onClick={handleImport}
                    disabled={selectedCount === 0}
                    className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <AiIcon className="w-4 h-4" />
                    {selectedCount} Szene{selectedCount !== 1 ? 'n' : ''} importieren
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AiIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2a5 5 0 0 1 5 5v1a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21h6M12 17v4" strokeLinecap="round" />
      <path d="M5 10a7 7 0 0 0 14 0" strokeLinecap="round" />
    </svg>
  )
}

function UploadIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="17,8 12,3 7,8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
    </svg>
  )
}

function XIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

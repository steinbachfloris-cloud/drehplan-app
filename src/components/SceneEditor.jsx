import { useState, useEffect } from 'react'
import useProjectStore from '../store/projectStore'
import { createScene } from '../store/projectStore'

const STATUSES = [
  { value: 'offen', label: 'Offen' },
  { value: 'in_bearbeitung', label: 'In Bearbeitung' },
  { value: 'abgedreht', label: 'Abgedreht' },
]

const MOODS = ['I', 'A', 'T', 'N']
const MOOD_LABELS = { I: 'INT', A: 'EXT', T: 'TAG', N: 'NACHT' }

const FARBEN = [
  '#ffffff', '#f5f5dc', '#fef08a', '#fde68a', '#fed7aa',
  '#fca5a5', '#86efac', '#93c5fd', '#c4b5fd', '#f9a8d4',
  '#6ee7b7', '#67e8f9', '#a5b4fc', '#d4d4d4', '#111111',
]

const KATEGORIE_TYPES = [
  { key: 'motive', label: 'Motive' },
  { key: 'rollen', label: 'Rollen' },
  { key: 'komparsen', label: 'Komparsen' },
  { key: 'requisiten', label: 'Requisiten' },
  { key: 'kostüm', label: 'Kostüm' },
  { key: 'sfx', label: 'SFX' },
  { key: 'vfx', label: 'VFX' },
  { key: 'tiere', label: 'Tiere' },
  { key: 'fahrzeuge', label: 'Fahrzeuge' },
]

export default function SceneEditor({ sceneId, onClose }) {
  const project = useProjectStore((s) => s.project)
  const addScene = useProjectStore((s) => s.addScene)
  const updateScene = useProjectStore((s) => s.updateScene)
  const deleteScene = useProjectStore((s) => s.deleteScene)
  const addKategorie = useProjectStore((s) => s.addKategorie)

  const isNew = !sceneId
  const existing = sceneId ? project.szenen[sceneId] : null

  const [form, setForm] = useState(() =>
    existing ? { ...existing } : createScene()
  )

  const [activeTab, setActiveTab] = useState('allgemein')
  const [newKat, setNewKat] = useState({})

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const toggleMood = (m) => {
    const current = (form.stimmung || '').split('/').filter(Boolean)
    const next = current.includes(m)
      ? current.filter((x) => x !== m)
      : [...current, m]
    set('stimmung', next.join('/'))
  }

  const handleSave = () => {
    if (isNew) {
      addScene(form)
    } else {
      updateScene(sceneId, form)
    }
    onClose()
  }

  const handleDelete = () => {
    if (window.confirm('Szene wirklich löschen?')) {
      deleteScene(sceneId)
      onClose()
    }
  }

  const toggleKatItem = (type, id) => {
    const current = form[type] || []
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id]
    set(type, next)
  }

  const addNewKat = (type) => {
    const val = (newKat[type] || '').trim()
    if (!val) return
    addKategorie(type, { kürzel: val.slice(0, 4).toUpperCase(), name: val, notizen: '' })
    setNewKat((n) => ({ ...n, [type]: '' }))
  }

  const selectedMoods = (form.stimmung || '').split('/').filter(Boolean)

  const TABS = [
    { id: 'allgemein', label: 'Allgemein' },
    { id: 'kategorien', label: 'Verknüpfungen' },
    { id: 'notizen', label: 'Notizen' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-500 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: form.farbe || '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}
            />
            <h2 className="font-semibold text-white text-lg">
              {isNew ? 'Neue Szene' : `Szene ${form.bildnummer || '—'}`}
            </h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-dark-600 px-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'allgemein' && (
            <div className="space-y-5">
              {/* Row 1: Bildnummer + Spieltag + Status */}
              <div className="grid grid-cols-3 gap-4">
                <Field label="Bildnummer">
                  <input
                    className="input w-full"
                    placeholder="z.B. 42A"
                    value={form.bildnummer}
                    onChange={(e) => set('bildnummer', e.target.value)}
                  />
                </Field>
                <Field label="Spieltag">
                  <input
                    className="input w-full"
                    placeholder="z.B. 2014/1"
                    value={form.spieltag || ''}
                    onChange={(e) => set('spieltag', e.target.value)}
                  />
                </Field>
                <Field label="Status">
                  <select
                    className="input w-full"
                    value={form.status}
                    onChange={(e) => set('status', e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Synopsis */}
              <Field label="Synopsis">
                <textarea
                  className="input w-full resize-none"
                  rows={3}
                  placeholder="Kurze Beschreibung der Szene…"
                  value={form.synopsis}
                  onChange={(e) => set('synopsis', e.target.value)}
                />
              </Field>

              {/* Stimmung + Vorstopp */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Stimmung (INT/EXT/TAG/NACHT)">
                  <div className="flex gap-1.5 flex-wrap">
                    {MOODS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMood(m)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          selectedMoods.includes(m)
                            ? 'bg-accent text-dark-900 border-accent'
                            : 'bg-dark-700 text-gray-400 border-dark-500 hover:border-accent/50'
                        }`}
                      >
                        {MOOD_LABELS[m]}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Optionen">
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-amber-400"
                      checked={form.vorstopp}
                      onChange={(e) => set('vorstopp', e.target.checked)}
                    />
                    <span className="text-sm text-gray-300">Vorstopp</span>
                  </label>
                </Field>
              </div>

              {/* Seiten / Dauer / Shots */}
              <div className="grid grid-cols-3 gap-4">
                <Field label="Seiten (⅛)">
                  <input
                    type="number"
                    min={0}
                    step={0.125}
                    className="input w-full"
                    value={form.seiten}
                    onChange={(e) => set('seiten', parseFloat(e.target.value) || 0)}
                  />
                </Field>
                <Field label='Dauer (Sekunden)'>
                  <input
                    type="number"
                    min={0}
                    className="input w-full"
                    value={form.dauer}
                    onChange={(e) => set('dauer', parseInt(e.target.value) || 0)}
                  />
                </Field>
                <Field label="Shots">
                  <input
                    type="number"
                    min={0}
                    className="input w-full"
                    value={form.shots}
                    onChange={(e) => set('shots', parseInt(e.target.value) || 0)}
                  />
                </Field>
              </div>

              {/* Color / Strip color */}
              <Field label="Streifenfarbe">
                <p className="text-[10px] text-gray-600 mb-2">Hintergrundfarbe des Szenen-Streifens</p>
                <div className="flex gap-2 flex-wrap">
                  {FARBEN.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set('farbe', c)}
                      className={`w-7 h-7 rounded transition-all border ${
                        form.farbe === c
                          ? 'ring-2 ring-accent ring-offset-1 ring-offset-dark-800 scale-110'
                          : 'border-dark-500 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    className="w-7 h-7 rounded border border-dark-500 cursor-pointer"
                    value={form.farbe || '#ffffff'}
                    onChange={(e) => set('farbe', e.target.value)}
                    title="Eigene Farbe"
                  />
                </div>
              </Field>
            </div>
          )}

          {activeTab === 'kategorien' && (
            <div className="space-y-4">
              {KATEGORIE_TYPES.map(({ key, label }) => {
                const options = project.kategorien[key] || []
                const selected = form[key] || []
                return (
                  <div key={key}>
                    <div className="label mb-2">{label}</div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {options.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleKatItem(key, item.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                            selected.includes(item.id)
                              ? 'bg-accent/20 border-accent/60 text-accent'
                              : 'bg-dark-700 border-dark-500 text-gray-400 hover:border-dark-400'
                          }`}
                          title={item.notizen}
                        >
                          {item.kürzel} – {item.name}
                        </button>
                      ))}
                      {options.length === 0 && (
                        <span className="text-xs text-gray-600">Noch keine {label} vorhanden</span>
                      )}
                    </div>
                    {/* Quick-add */}
                    <div className="flex gap-2">
                      <input
                        className="input flex-1 py-1 text-xs"
                        placeholder={`Neue ${label.slice(0, -1)} hinzufügen…`}
                        value={newKat[key] || ''}
                        onChange={(e) => setNewKat((n) => ({ ...n, [key]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && addNewKat(key)}
                      />
                      <button
                        type="button"
                        onClick={() => addNewKat(key)}
                        className="btn-ghost px-2 py-1 text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'notizen' && (
            <div className="space-y-4">
              <Field label="Notizen">
                <textarea
                  className="input w-full resize-none"
                  rows={5}
                  placeholder="Allgemeine Notizen zur Szene…"
                  value={form.notizen}
                  onChange={(e) => set('notizen', e.target.value)}
                />
              </Field>
              <Field label="Kamera-Notizen">
                <textarea
                  className="input w-full resize-none"
                  rows={5}
                  placeholder="Kameraanweisungen, Objektive, Bewegungen…"
                  value={form.kameraNotizen}
                  onChange={(e) => set('kameraNotizen', e.target.value)}
                />
              </Field>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-dark-600">
          <div>
            {!isNew && (
              <button onClick={handleDelete} className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
                Szene löschen
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary">Abbrechen</button>
            <button onClick={handleSave} className="btn-primary">
              {isNew ? 'Szene anlegen' : 'Speichern'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label mb-1.5 block">{label}</label>
      {children}
    </div>
  )
}

function XIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  )
}

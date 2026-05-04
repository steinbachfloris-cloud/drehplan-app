import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

const MOODS = ['I', 'A', 'T', 'N']
const STATUSES = ['offen', 'in_bearbeitung', 'abgedreht']

const defaultCategories = () => ({
  motive: [],
  rollen: [],
  komparsen: [],
  requisiten: [],
  kostüm: [],
  sfx: [],
  vfx: [],
  tiere: [],
  fahrzeuge: [],
})

export const createScene = (overrides = {}) => ({
  id: uuidv4(),
  bildnummer: '',
  synopsis: '',
  stimmung: '',
  vorstopp: false,
  seiten: 1,
  dauer: 1,
  shots: 0,
  status: 'offen',
  farbe: '#3b82f6',
  notizen: '',
  kameraNotizen: '',
  motive: [],
  rollen: [],
  komparsen: [],
  requisiten: [],
  kostüm: [],
  sfx: [],
  vfx: [],
  tiere: [],
  fahrzeuge: [],
  ...overrides,
})

export const createShootingDay = (overrides = {}) => ({
  id: uuidv4(),
  nummer: 1,
  datum: null,
  drehbeginn: '07:00',
  kommentarZeilen: [],
  szenenIds: [],
  ...overrides,
})

export const createProject = (name = 'Neues Projekt') => ({
  id: uuidv4(),
  name,
  erstellt: new Date().toISOString(),
  startdatum: null,
  szenen: {},
  drehtage: [],
  boneyardIds: [],
  kategorien: defaultCategories(),
  sperrzeiten: {},
})

const useProjectStore = create((set, get) => ({
  project: null,
  isDirty: false,

  newProject: (name) => {
    const p = createProject(name)
    set({ project: p, isDirty: false })
  },

  loadProject: (data) => {
    set({ project: data, isDirty: false })
  },

  setDirty: () => set({ isDirty: true }),

  updateProjectName: (name) =>
    set((s) => ({ project: { ...s.project, name }, isDirty: true })),

  setStartdatum: (datum) => {
    const { project } = get()
    const updated = { ...project, startdatum: datum }
    // Auto-fill dates for all shooting days
    if (datum) {
      const start = new Date(datum)
      updated.drehtage = project.drehtage.map((day, idx) => {
        const d = new Date(start)
        d.setDate(start.getDate() + idx)
        return { ...day, datum: d.toISOString().split('T')[0] }
      })
    }
    set({ project: updated, isDirty: true })
  },

  // Scenes
  addScene: (sceneData) => {
    const scene = createScene(sceneData)
    set((s) => ({
      project: {
        ...s.project,
        szenen: { ...s.project.szenen, [scene.id]: scene },
        boneyardIds: [...s.project.boneyardIds, scene.id],
      },
      isDirty: true,
    }))
    return scene.id
  },

  updateScene: (id, updates) =>
    set((s) => ({
      project: {
        ...s.project,
        szenen: {
          ...s.project.szenen,
          [id]: { ...s.project.szenen[id], ...updates },
        },
      },
      isDirty: true,
    })),

  deleteScene: (id) => {
    set((s) => {
      const szenen = { ...s.project.szenen }
      delete szenen[id]
      const boneyardIds = s.project.boneyardIds.filter((x) => x !== id)
      const drehtage = s.project.drehtage.map((d) => ({
        ...d,
        szenenIds: d.szenenIds.filter((x) => x !== id),
      }))
      return {
        project: { ...s.project, szenen, boneyardIds, drehtage },
        isDirty: true,
      }
    })
  },

  // Shooting days
  addShootingDay: () => {
    const { project } = get()
    const nummer = project.drehtage.length + 1
    let datum = null
    if (project.startdatum) {
      const start = new Date(project.startdatum)
      start.setDate(start.getDate() + project.drehtage.length)
      datum = start.toISOString().split('T')[0]
    }
    const day = createShootingDay({ nummer, datum })
    set((s) => ({
      project: {
        ...s.project,
        drehtage: [...s.project.drehtage, day],
      },
      isDirty: true,
    }))
  },

  updateShootingDay: (id, updates) =>
    set((s) => ({
      project: {
        ...s.project,
        drehtage: s.project.drehtage.map((d) =>
          d.id === id ? { ...d, ...updates } : d
        ),
      },
      isDirty: true,
    })),

  deleteShootingDay: (id) => {
    set((s) => {
      const day = s.project.drehtage.find((d) => d.id === id)
      const boneyardIds = [...s.project.boneyardIds, ...(day?.szenenIds || [])]
      const drehtage = s.project.drehtage
        .filter((d) => d.id !== id)
        .map((d, i) => ({ ...d, nummer: i + 1 }))
      return {
        project: { ...s.project, drehtage, boneyardIds },
        isDirty: true,
      }
    })
  },

  // DnD moves
  moveSceneToBoneyard: (sceneId, fromDayId) => {
    set((s) => {
      const drehtage = s.project.drehtage.map((d) =>
        d.id === fromDayId
          ? { ...d, szenenIds: d.szenenIds.filter((x) => x !== sceneId) }
          : d
      )
      const boneyardIds = s.project.boneyardIds.includes(sceneId)
        ? s.project.boneyardIds
        : [...s.project.boneyardIds, sceneId]
      return {
        project: { ...s.project, drehtage, boneyardIds },
        isDirty: true,
      }
    })
  },

  moveSceneToDay: (sceneId, toDayId, toIndex, fromDayId) => {
    set((s) => {
      let boneyardIds = s.project.boneyardIds.filter((x) => x !== sceneId)
      const drehtage = s.project.drehtage.map((d) => {
        if (d.id === fromDayId && fromDayId !== toDayId) {
          return { ...d, szenenIds: d.szenenIds.filter((x) => x !== sceneId) }
        }
        if (d.id === toDayId) {
          const ids = d.szenenIds.filter((x) => x !== sceneId)
          const idx = toIndex == null ? ids.length : toIndex
          ids.splice(idx, 0, sceneId)
          return { ...d, szenenIds: ids }
        }
        return d
      })
      return {
        project: { ...s.project, drehtage, boneyardIds },
        isDirty: true,
      }
    })
  },

  reorderBoneyard: (activeId, overId) => {
    set((s) => {
      const ids = [...s.project.boneyardIds]
      const from = ids.indexOf(activeId)
      const to = ids.indexOf(overId)
      if (from === -1 || to === -1) return s
      ids.splice(from, 1)
      ids.splice(to, 0, activeId)
      return {
        project: { ...s.project, boneyardIds: ids },
        isDirty: true,
      }
    })
  },

  // Categories
  addKategorie: (type, item) =>
    set((s) => ({
      project: {
        ...s.project,
        kategorien: {
          ...s.project.kategorien,
          [type]: [...s.project.kategorien[type], { id: uuidv4(), ...item }],
        },
      },
      isDirty: true,
    })),

  // Save / export
  getProjectJSON: () => {
    const { project } = get()
    return JSON.stringify(project, null, 2)
  },
}))

export default useProjectStore

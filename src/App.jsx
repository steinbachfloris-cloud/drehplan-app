import { useState } from 'react'
import useProjectStore from './store/projectStore'
import HomePage from './components/HomePage'
import Board from './components/Board'

export default function App() {
  const project = useProjectStore((s) => s.project)

  return (
    <div className="min-h-screen bg-dark-900">
      {!project ? <HomePage /> : <Board />}
    </div>
  )
}

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Timestamp } from 'firebase/firestore'
import TaskList from '../../src/components/TaskList/taskList'
import type { Task } from '../../src/types/task'

const makeTasks = (n: number): Task[] =>
  Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    userId: 'user1',
    title: `Tarea ${i + 1}`,
    description: '',
    completed: false,
    createdAt: Timestamp.fromDate(new Date()),
  }))

describe('TaskList', () => {
  it('muestra mensaje vacío cuando no hay tareas', () => {
    render(<TaskList tasks={[]} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText(/no tenés tareas todavía/i)).toBeInTheDocument()
  })

  it('renderiza una TaskCard por cada tarea', () => {
    const tasks = makeTasks(3)
    render(<TaskList tasks={tasks} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Tarea 1')).toBeInTheDocument()
    expect(screen.getByText('Tarea 2')).toBeInTheDocument()
    expect(screen.getByText('Tarea 3')).toBeInTheDocument()
  })

  it('no muestra el mensaje vacío cuando hay tareas', () => {
    const tasks = makeTasks(1)
    render(<TaskList tasks={tasks} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.queryByText(/no tenés tareas todavía/i)).not.toBeInTheDocument()
  })

  // --- Nuevos ---

  it('muestra el mensaje de vacío personalizado via emptyMessage', () => {
    render(
      <TaskList
        tasks={[]}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        emptyMessage="No hay tareas pendientes."
      />
    )
    expect(screen.getByText('No hay tareas pendientes.')).toBeInTheDocument()
  })

  it('muestra el drag handle en cada tarjeta cuando sortable=true (default)', () => {
    const tasks = makeTasks(2)
    render(<TaskList tasks={tasks} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    const handles = screen.getAllByRole('button', { name: /arrastrar tarea/i })
    expect(handles).toHaveLength(2)
  })

  it('oculta el drag handle en todas las tarjetas cuando sortable=false', () => {
    const tasks = makeTasks(2)
    render(
      <TaskList tasks={tasks} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} sortable={false} />
    )
    expect(screen.queryAllByRole('button', { name: /arrastrar tarea/i })).toHaveLength(0)
  })
})

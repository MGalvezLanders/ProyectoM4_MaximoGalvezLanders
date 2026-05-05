import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Timestamp } from 'firebase/firestore'
import TaskCard from '../../src/components/TaskCard/TaskCard'
import type { Task } from '../../src/types/task'

const baseTask: Task = {
  id: '1',
  userId: 'user1',
  title: 'Tarea de prueba',
  description: 'Descripción de prueba',
  completed: false,
  createdAt: Timestamp.fromDate(new Date('2024-01-15')),
}

describe('TaskCard', () => {
  it('renderiza el título y la descripción', () => {
    render(<TaskCard task={baseTask} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Tarea de prueba')).toBeInTheDocument()
    expect(screen.getByText('Descripción de prueba')).toBeInTheDocument()
  })

  it('no muestra descripción si está vacía', () => {
    const task = { ...baseTask, description: '' }
    render(<TaskCard task={task} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.queryByText('Descripción de prueba')).not.toBeInTheDocument()
  })

  it('el checkbox refleja el estado completed', () => {
    const { rerender } = render(
      <TaskCard task={baseTask} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />
    )
    expect(screen.getByRole('checkbox')).not.toBeChecked()

    rerender(
      <TaskCard task={{ ...baseTask, completed: true }} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />
    )
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('llama onToggle con el id al hacer click en el checkbox', async () => {
    const onToggle = vi.fn()
    render(<TaskCard task={baseTask} onToggle={onToggle} onEdit={vi.fn()} onDelete={vi.fn()} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith('1')
  })

  it('llama onEdit con la tarea al hacer click en Editar', async () => {
    const onEdit = vi.fn()
    render(<TaskCard task={baseTask} onToggle={vi.fn()} onEdit={onEdit} onDelete={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /editar/i }))
    expect(onEdit).toHaveBeenCalledWith(baseTask)
  })

  it('llama onDelete con el id al hacer click en Eliminar', async () => {
    const onDelete = vi.fn()
    render(<TaskCard task={baseTask} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={onDelete} />)
    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }))
    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('el botón Editar está deshabilitado cuando la tarea está completada', () => {
    const task = { ...baseTask, completed: true }
    render(<TaskCard task={task} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByRole('button', { name: /editar/i })).toBeDisabled()
  })

  it('el botón Eliminar está habilitado aunque la tarea esté completada', () => {
    const task = { ...baseTask, completed: true }
    render(<TaskCard task={task} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByRole('button', { name: /eliminar/i })).toBeEnabled()
  })

  // --- Nuevos: prioridad ---

  it('muestra el badge de prioridad Alta', () => {
    const task = { ...baseTask, priority: 'high' as const }
    render(<TaskCard task={task} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Alta')).toBeInTheDocument()
  })

  it('muestra el badge de prioridad Media', () => {
    const task = { ...baseTask, priority: 'medium' as const }
    render(<TaskCard task={task} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Media')).toBeInTheDocument()
  })

  it('muestra el badge de prioridad Baja', () => {
    const task = { ...baseTask, priority: 'low' as const }
    render(<TaskCard task={task} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Baja')).toBeInTheDocument()
  })

  it('no muestra badge de prioridad cuando priority es undefined', () => {
    render(<TaskCard task={baseTask} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.queryByText('Alta')).not.toBeInTheDocument()
    expect(screen.queryByText('Media')).not.toBeInTheDocument()
    expect(screen.queryByText('Baja')).not.toBeInTheDocument()
  })

  // --- Nuevos: fecha de vencimiento ---

  it('muestra "Vence:" cuando hay una fecha de vencimiento futura', () => {
    const task = { ...baseTask, dueDate: Timestamp.fromDate(new Date('2099-12-31')) }
    render(<TaskCard task={task} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText(/vence:/i)).toBeInTheDocument()
  })

  it('no muestra fecha de vencimiento cuando dueDate es undefined', () => {
    render(<TaskCard task={baseTask} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.queryByText(/vence:/i)).not.toBeInTheDocument()
  })

  it('muestra indicador "⚠ Vencida:" para tareas pendientes con fecha pasada', () => {
    const task = { ...baseTask, dueDate: Timestamp.fromDate(new Date('2000-01-01')) }
    render(<TaskCard task={task} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText(/⚠ vencida:/i)).toBeInTheDocument()
  })

  it('no muestra indicador de vencida si la tarea está completada aunque la fecha haya pasado', () => {
    const task = {
      ...baseTask,
      completed: true,
      dueDate: Timestamp.fromDate(new Date('2000-01-01')),
    }
    render(<TaskCard task={task} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.queryByText(/⚠ vencida:/i)).not.toBeInTheDocument()
  })

  // --- Nuevos: drag handle ---

  it('muestra el drag handle por defecto (sortable=true)', () => {
    render(<TaskCard task={baseTask} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByRole('button', { name: /arrastrar tarea/i })).toBeInTheDocument()
  })

  it('oculta el drag handle cuando sortable es false', () => {
    render(
      <TaskCard task={baseTask} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} sortable={false} />
    )
    expect(screen.queryByRole('button', { name: /arrastrar tarea/i })).not.toBeInTheDocument()
  })
})

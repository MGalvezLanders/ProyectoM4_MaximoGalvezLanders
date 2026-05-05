import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskForm from '../../src/components/TaskForm/taskForm'

describe('TaskForm', () => {
  it('renderiza el título del formulario por defecto', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('Nueva tarea')).toBeInTheDocument()
  })

  it('renderiza un título personalizado', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} formTitle="Editar tarea" />)
    expect(screen.getByText('Editar tarea')).toBeInTheDocument()
  })

  it('precarga los valores iniciales de título y descripción', () => {
    render(
      <TaskForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        initialTitle="Mi tarea"
        initialDescription="Mi descripción"
      />
    )
    expect(screen.getByDisplayValue('Mi tarea')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Mi descripción')).toBeInTheDocument()
  })

  it('el botón submit está deshabilitado cuando el título está vacío', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: /agregar tarea/i })).toBeDisabled()
  })

  it('el botón submit se habilita al escribir un título', async () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/título/i), 'Nueva tarea')
    expect(screen.getByRole('button', { name: /agregar tarea/i })).toBeEnabled()
  })

  it('llama onSubmit con el objeto completo al hacer submit', async () => {
    const onSubmit = vi.fn()
    render(<TaskForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/título/i), 'Mi tarea')
    await userEvent.type(screen.getByLabelText(/descripción/i), 'Mi descripción')
    await userEvent.click(screen.getByRole('button', { name: /agregar tarea/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Mi tarea',
      description: 'Mi descripción',
      dueDate: null,
      priority: 'medium',
    })
  })

  it('no llama onSubmit con título de solo espacios', async () => {
    const onSubmit = vi.fn()
    render(<TaskForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/título/i), '   ')
    await userEvent.click(screen.getByRole('button', { name: /agregar tarea/i }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('llama onCancel al hacer click en Cancelar', async () => {
    const onCancel = vi.fn()
    render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('muestra el label del botón personalizado', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} submitLabel="Guardar cambios" />)
    expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeInTheDocument()
  })

  // --- Nuevos: fecha de vencimiento ---

  it('muestra el campo de fecha de vencimiento', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/fecha de vencimiento/i)).toBeInTheDocument()
  })

  it('muestra el hint de fecha por defecto', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText(/sin fecha.*1 mes/i)).toBeInTheDocument()
  })

  it('envía la fecha seleccionada como Date', async () => {
    const onSubmit = vi.fn()
    render(<TaskForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/título/i), 'Tarea con fecha')
    fireEvent.change(screen.getByLabelText(/fecha de vencimiento/i), {
      target: { value: '2099-06-15' },
    })
    await userEvent.click(screen.getByRole('button', { name: /agregar tarea/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ dueDate: expect.any(Date) })
    )
  })

  it('envía dueDate null cuando la fecha está vacía', async () => {
    const onSubmit = vi.fn()
    render(<TaskForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/título/i), 'Sin fecha')
    await userEvent.click(screen.getByRole('button', { name: /agregar tarea/i }))

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ dueDate: null }))
  })

  // --- Nuevos: prioridad ---

  it('muestra el selector de prioridad', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/prioridad/i)).toBeInTheDocument()
  })

  it('el selector de prioridad tiene valor predeterminado "medium"', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/prioridad/i)).toHaveValue('medium')
  })

  it('precarga la prioridad inicial', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} initialPriority="high" />)
    expect(screen.getByLabelText(/prioridad/i)).toHaveValue('high')
  })

  it('envía la prioridad seleccionada', async () => {
    const onSubmit = vi.fn()
    render(<TaskForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/título/i), 'Tarea urgente')
    await userEvent.selectOptions(screen.getByLabelText(/prioridad/i), 'high')
    await userEvent.click(screen.getByRole('button', { name: /agregar tarea/i }))

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ priority: 'high' }))
  })
})

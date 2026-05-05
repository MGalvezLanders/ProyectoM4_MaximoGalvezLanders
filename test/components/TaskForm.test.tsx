import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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

  it('precarga los valores iniciales', () => {
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

  it('llama onSubmit con título y descripción al hacer submit', async () => {
    const onSubmit = vi.fn()
    render(<TaskForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/título/i), 'Mi tarea')
    await userEvent.type(screen.getByLabelText(/descripción/i), 'Mi descripción')
    await userEvent.click(screen.getByRole('button', { name: /agregar tarea/i }))

    expect(onSubmit).toHaveBeenCalledWith('Mi tarea', 'Mi descripción')
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
})

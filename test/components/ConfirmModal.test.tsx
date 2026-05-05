import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmModal from '../../src/components/ConfirmModal/ConfirmModal'

describe('ConfirmModal', () => {
  it('renderiza el mensaje', () => {
    render(<ConfirmModal message="¿Eliminar esta tarea?" onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('¿Eliminar esta tarea?')).toBeInTheDocument()
  })

  it('llama onConfirm al hacer click en Eliminar', async () => {
    const onConfirm = vi.fn()
    render(<ConfirmModal message="¿Eliminar?" onConfirm={onConfirm} onCancel={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('llama onCancel al hacer click en Cancelar', async () => {
    const onCancel = vi.fn()
    render(<ConfirmModal message="¿Eliminar?" onConfirm={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('llama onCancel al hacer click en el overlay', async () => {
    const onCancel = vi.fn()
    const { container } = render(
      <ConfirmModal message="¿Eliminar?" onConfirm={vi.fn()} onCancel={onCancel} />
    )
    const overlay = container.firstChild as HTMLElement
    await userEvent.click(overlay)
    expect(onCancel).toHaveBeenCalled()
  })

  it('no llama onCancel al hacer click dentro del dialog', async () => {
    const onCancel = vi.fn()
    render(<ConfirmModal message="¿Eliminar?" onConfirm={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByText('¿Eliminar?'))
    expect(onCancel).not.toHaveBeenCalled()
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Timestamp } from 'firebase/firestore'
import { buildTodoSummary } from '../../src/components/buildSummary/BuildTodoSummary'
import EmailSummaryButton from '../../src/components/buildSummary/BuildTodoSummary'
import type { Task } from '../../src/types/task'

const makeTask = (id: string, title: string, completed: boolean, description = ''): Task => ({
  id,
  userId: 'user1',
  title,
  description,
  completed,
  createdAt: Timestamp.fromDate(new Date('2024-06-01')),
})

describe('buildTodoSummary', () => {
  it('incluye conteo de pendientes y completadas', () => {
    const tasks = [
      makeTask('1', 'Tarea A', false),
      makeTask('2', 'Tarea B', true),
      makeTask('3', 'Tarea C', false),
    ]
    const result = buildTodoSummary(tasks)
    expect(result).toContain('Pendientes (2)')
    expect(result).toContain('Completadas (1)')
  })

  it('incluye los títulos de las tareas', () => {
    const tasks = [makeTask('1', 'Hacer compras', false)]
    const result = buildTodoSummary(tasks)
    expect(result).toContain('Hacer compras')
  })

  it('incluye la descripción si existe', () => {
    const tasks = [makeTask('1', 'Tarea', false, 'Detalle importante')]
    const result = buildTodoSummary(tasks)
    expect(result).toContain('Detalle importante')
  })

  it('muestra (ninguna) cuando no hay tareas de un tipo', () => {
    const tasks = [makeTask('1', 'Solo esta', true)]
    const result = buildTodoSummary(tasks)
    expect(result).toContain('(ninguna)')
  })

  it('devuelve string vacío de pendientes y completadas con lista vacía', () => {
    const result = buildTodoSummary([])
    expect(result).toContain('Pendientes (0)')
    expect(result).toContain('Completadas (0)')
  })
})

describe('EmailSummaryButton', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renderiza el botón con texto inicial', () => {
    render(<EmailSummaryButton todos={[]} userEmail="test@test.com" />)
    expect(screen.getByRole('button', { name: /enviar mi resumen/i })).toBeInTheDocument()
  })

  it('muestra "Enviando..." mientras carga', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {}))
    render(<EmailSummaryButton todos={[]} userEmail="test@test.com" />)
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveTextContent('Enviando...')
  })

  it('muestra mensaje de éxito cuando la API responde ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )
    render(<EmailSummaryButton todos={[]} userEmail="test@test.com" />)
    await userEvent.click(screen.getByRole('button'))
    expect(await screen.findByText(/email enviado correctamente/i)).toBeInTheDocument()
  })

  it('muestra mensaje de error cuando la API responde con error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Error de servidor' }), { status: 500 })
    )
    render(<EmailSummaryButton todos={[]} userEmail="test@test.com" />)
    await userEvent.click(screen.getByRole('button'))
    expect(await screen.findByText('Error de servidor')).toBeInTheDocument()
  })

  it('muestra error de conexión si fetch lanza excepción', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))
    render(<EmailSummaryButton todos={[]} userEmail="test@test.com" />)
    await userEvent.click(screen.getByRole('button'))
    expect(await screen.findByText(/no se pudo conectar/i)).toBeInTheDocument()
  })
})

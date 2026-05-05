import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLoginForm } from '../../../src/features/auth/useLoginForm'

const mockNavigate = vi.fn()
const mockSingIn = vi.fn()
const mockSignInWithGoogle = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('../../../src/features/auth/Authenticator', () => ({
  useAuth: () => ({
    singIn: mockSingIn,
    signInWithGoogle: mockSignInWithGoogle,
  }),
}))

describe('useLoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inicializa con campos vacíos y sin errores', () => {
    const { result } = renderHook(() => useLoginForm())
    expect(result.current.form).toEqual({ email: '', password: '' })
    expect(result.current.errors).toEqual({})
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.firebaseError).toBe('')
  })

  it('actualiza el campo email al cambiar', () => {
    const { result } = renderHook(() => useLoginForm())
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@test.com' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    expect(result.current.form.email).toBe('test@test.com')
  })

  it('muestra error de validación para email inválido', () => {
    const { result } = renderHook(() => useLoginForm())
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'invalido' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    expect(result.current.errors.email).toBeTruthy()
  })

  it('no llama singIn si hay errores de validación', async () => {
    const { result } = renderHook(() => useLoginForm())
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() })
    })
    expect(mockSingIn).not.toHaveBeenCalled()
  })

  it('llama singIn y navega a /tasks con credenciales válidas', async () => {
    mockSingIn.mockResolvedValueOnce({})
    const { result } = renderHook(() => useLoginForm())

    act(() => { result.current.handleChange({ target: { name: 'email', value: 'user@test.com' } } as React.ChangeEvent<HTMLInputElement>) })
    act(() => { result.current.handleChange({ target: { name: 'password', value: 'password123' } } as React.ChangeEvent<HTMLInputElement>) })

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() })
    })

    expect(mockSingIn).toHaveBeenCalledWith('user@test.com', 'password123')
    expect(mockNavigate).toHaveBeenCalledWith('/tasks')
  })

  it('setea firebaseError si singIn falla', async () => {
    mockSingIn.mockRejectedValueOnce({ code: 'auth/invalid-credential', message: '' })
    const { result } = renderHook(() => useLoginForm())

    act(() => { result.current.handleChange({ target: { name: 'email', value: 'user@test.com' } } as React.ChangeEvent<HTMLInputElement>) })
    act(() => { result.current.handleChange({ target: { name: 'password', value: 'password123' } } as React.ChangeEvent<HTMLInputElement>) })

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() })
    })

    expect(result.current.firebaseError).toBe('Email o contraseña incorrectos.')
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('llama signInWithGoogle y navega a /tasks', async () => {
    mockSignInWithGoogle.mockResolvedValueOnce({})
    const { result } = renderHook(() => useLoginForm())

    await act(async () => {
      await result.current.handleGoogleSignIn()
    })

    expect(mockSignInWithGoogle).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/tasks')
  })
})

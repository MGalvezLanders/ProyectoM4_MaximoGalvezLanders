import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRegisterForm } from '../../../src/features/auth/useRegisterForm'

const mockNavigate = vi.fn()
const mockSignUp = vi.fn()
const mockSignInWithGoogle = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('../../../src/features/auth/Authenticator', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
    signInWithGoogle: mockSignInWithGoogle,
  }),
}))

describe('useRegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inicializa con campos vacíos y sin errores', () => {
    const { result } = renderHook(() => useRegisterForm())
    expect(result.current.form).toEqual({ email: '', password: '' })
    expect(result.current.errors).toEqual({})
    expect(result.current.isSubmitting).toBe(false)
  })

  it('muestra error de validación para contraseña corta', () => {
    const { result } = renderHook(() => useRegisterForm())
    act(() => {
      result.current.handleChange({ target: { name: 'password', value: '123' } } as React.ChangeEvent<HTMLInputElement>)
    })
    expect(result.current.errors.password).toBeTruthy()
  })

  it('no llama signUp si hay errores de validación', async () => {
    const { result } = renderHook(() => useRegisterForm())
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() })
    })
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('llama signUp y navega a /tasks con datos válidos', async () => {
    mockSignUp.mockResolvedValueOnce({})
    const { result } = renderHook(() => useRegisterForm())

    act(() => { result.current.handleChange({ target: { name: 'email', value: 'nuevo@test.com' } } as React.ChangeEvent<HTMLInputElement>) })
    act(() => { result.current.handleChange({ target: { name: 'password', value: 'password123' } } as React.ChangeEvent<HTMLInputElement>) })

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() })
    })

    expect(mockSignUp).toHaveBeenCalledWith('nuevo@test.com', 'password123')
    expect(mockNavigate).toHaveBeenCalledWith('/tasks')
  })

  it('setea firebaseError si el email ya está en uso', async () => {
    mockSignUp.mockRejectedValueOnce({ code: 'auth/email-already-in-use', message: '' })
    const { result } = renderHook(() => useRegisterForm())

    act(() => { result.current.handleChange({ target: { name: 'email', value: 'existente@test.com' } } as React.ChangeEvent<HTMLInputElement>) })
    act(() => { result.current.handleChange({ target: { name: 'password', value: 'password123' } } as React.ChangeEvent<HTMLInputElement>) })

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() })
    })

    expect(result.current.firebaseError).toBe('Ese email ya está registrado.')
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('llama signInWithGoogle y navega a /tasks', async () => {
    mockSignInWithGoogle.mockResolvedValueOnce({})
    const { result } = renderHook(() => useRegisterForm())

    await act(async () => {
      await result.current.handleGoogleSignIn()
    })

    expect(mockSignInWithGoogle).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/tasks')
  })
})

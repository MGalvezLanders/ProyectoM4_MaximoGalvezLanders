import { describe, it, expect } from 'vitest'
import { validateEmail, validatePassword, getAuthErrorMessage } from '../../../src/features/auth/authErrors'

describe('validateEmail', () => {
  it('retorna error si el email está vacío', () => {
    expect(validateEmail('')).toBe('El email es requerido')
  })

  it('retorna error si no tiene @', () => {
    expect(validateEmail('usuariogmail.com')).toBe('El email debe contener @')
  })

  it('retorna error si no tiene punto después del @', () => {
    expect(validateEmail('usuario@gmailcom')).toBe('El email debe tener un punto después del @')
  })

  it('retorna vacío para email válido', () => {
    expect(validateEmail('usuario@gmail.com')).toBe('')
  })

  it('retorna vacío para email con subdominio', () => {
    expect(validateEmail('user@mail.empresa.com')).toBe('')
  })
})

describe('validatePassword', () => {
  it('retorna error si la contraseña está vacía', () => {
    expect(validatePassword('')).toBe('La contraseña es requerida')
  })

  it('retorna error si tiene 6 caracteres o menos', () => {
    expect(validatePassword('abc12')).toBe('La contraseña debe tener más de 6 caracteres')
    expect(validatePassword('abcdef')).toBe('La contraseña debe tener más de 6 caracteres')
  })

  it('retorna vacío para contraseña válida', () => {
    expect(validatePassword('abcdefg')).toBe('')
    expect(validatePassword('contraseña123')).toBe('')
  })
})

describe('getAuthErrorMessage', () => {
  it('retorna mensaje para credencial inválida', () => {
    expect(getAuthErrorMessage({ code: 'auth/invalid-credential', message: '' }))
      .toBe('Email o contraseña incorrectos.')
  })

  it('retorna mensaje para usuario no encontrado', () => {
    expect(getAuthErrorMessage({ code: 'auth/user-not-found', message: '' }))
      .toBe('No existe una cuenta con este correo.')
  })

  it('retorna mensaje para email en uso', () => {
    expect(getAuthErrorMessage({ code: 'auth/email-already-in-use', message: '' }))
      .toBe('Ese email ya está registrado.')
  })

  it('retorna mensaje para contraseña débil', () => {
    expect(getAuthErrorMessage({ code: 'auth/weak-password', message: '' }))
      .toBe('La contraseña es muy débil (mínimo 6 caracteres).')
  })

  it('retorna mensaje genérico para código desconocido', () => {
    expect(getAuthErrorMessage({ code: 'auth/unknown', message: '' }))
      .toBe('Error de autenticación. Intentá nuevamente.')
  })
})

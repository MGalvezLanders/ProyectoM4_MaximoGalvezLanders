import { describe, it, expect } from 'vitest'
import { FirebaseError } from 'firebase/app'
import { handleFirestoreError } from '../../src/utils/handleFirestoreError'

function makeFirebaseError(code: string): FirebaseError {
  return new FirebaseError(code, code)
}

describe('handleFirestoreError', () => {
  it('lanza mensaje para permission-denied', () => {
    expect(() => handleFirestoreError(makeFirebaseError('permission-denied')))
      .toThrow('No tenés permisos para realizar esta acción.')
  })

  it('lanza mensaje para not-found', () => {
    expect(() => handleFirestoreError(makeFirebaseError('not-found')))
      .toThrow('La tarea no existe.')
  })

  it('lanza mensaje para unauthenticated', () => {
    expect(() => handleFirestoreError(makeFirebaseError('unauthenticated')))
      .toThrow('Sesión expirada. Volvé a iniciar sesión.')
  })

  it('lanza mensaje para unavailable', () => {
    expect(() => handleFirestoreError(makeFirebaseError('unavailable')))
      .toThrow('Servicio no disponible. Revisá tu conexión.')
  })

  it('lanza mensaje genérico para código desconocido', () => {
    expect(() => handleFirestoreError(makeFirebaseError('unknown-code')))
      .toThrow('Error inesperado (unknown-code).')
  })

  it('lanza mensaje del error si es un Error estándar', () => {
    expect(() => handleFirestoreError(new Error('algo salió mal')))
      .toThrow('algo salió mal')
  })

  it('lanza mensaje genérico para valor primitivo', () => {
    expect(() => handleFirestoreError('string error'))
      .toThrow('Error desconocido.')
  })
})

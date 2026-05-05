import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSend = vi.fn()

vi.mock('@aws-sdk/client-ses', () => {
  class MockSESClient {
    send = mockSend
  }
  class MockSendEmailCommand {
    input: unknown
    constructor(input: unknown) { this.input = input }
  }
  return {
    SESClient: MockSESClient,
    SendEmailCommand: MockSendEmailCommand,
  }
})

async function importHandler() {
  vi.resetModules()
  const mod = await import('../../api/send-email')
  return mod.default
}

function makeReq(method: string, body?: unknown) {
  return { method, body: body ?? {} }
}

function makeRes() {
  let statusCode = 200
  const res = {
    setHeader: vi.fn(),
    status: vi.fn().mockImplementation((code: number) => { statusCode = code; return res }),
    json: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
    getStatus: () => statusCode,
  }
  return res
}

describe('api/send-email handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.SES_FROM_EMAIL = 'from@test.com'
    process.env.AWS_REGION = 'us-east-1'
    process.env.AWS_ACCESS_KEY_ID = 'test-key'
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret'
  })

  it('devuelve 405 para métodos distintos de POST', async () => {
    const handler = await importHandler()
    const res = makeRes()
    await handler(makeReq('GET') as never, res as never)
    expect(res.status).toHaveBeenCalledWith(405)
  })

  it('responde 204 para OPTIONS (preflight CORS)', async () => {
    const handler = await importHandler()
    const res = makeRes()
    await handler(makeReq('OPTIONS') as never, res as never)
    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.end).toHaveBeenCalled()
  })

  it('devuelve 400 si falta "to"', async () => {
    const handler = await importHandler()
    const res = makeRes()
    await handler(makeReq('POST', { summary: 'resumen' }) as never, res as never)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('devuelve 400 si falta "summary"', async () => {
    const handler = await importHandler()
    const res = makeRes()
    await handler(makeReq('POST', { to: 'user@test.com' }) as never, res as never)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('devuelve 500 si SES_FROM_EMAIL no está configurado', async () => {
    delete process.env.SES_FROM_EMAIL
    const handler = await importHandler()
    const res = makeRes()
    await handler(makeReq('POST', { to: 'user@test.com', summary: 'resumen' }) as never, res as never)
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('llama a SES y devuelve 200 con los datos correctos', async () => {
    mockSend.mockResolvedValueOnce({ MessageId: 'msg-123' })
    const handler = await importHandler()
    const res = makeRes()
    await handler(
      makeReq('POST', { to: 'dest@test.com', summary: 'Pendientes: 1' }) as never,
      res as never
    )
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ ok: true, messageId: 'msg-123' })
  })

  it('devuelve 500 si SES lanza error', async () => {
    mockSend.mockRejectedValueOnce({ name: 'MessageRejected', message: 'Email address not verified' })
    const handler = await importHandler()
    const res = makeRes()
    await handler(
      makeReq('POST', { to: 'dest@test.com', summary: 'resumen' }) as never,
      res as never
    )
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: false }))
  })

  it('setea los headers CORS en todas las respuestas', async () => {
    const handler = await importHandler()
    const res = makeRes()
    await handler(makeReq('GET') as never, res as never)
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*')
  })
})

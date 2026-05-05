import 'dotenv/config'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import type { Plugin } from 'vite'
import type { ServerResponse } from 'node:http'
import type { Connect } from 'vite'

function sendEmailDevPlugin(): Plugin {
  return {
    name: 'dev-api-send-email',
    configureServer(server) {
      server.middlewares.use('/api/send-email', (req: Connect.IncomingMessage, res: ServerResponse) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method Not Allowed' }))
          return
        }

        let raw = ''
        req.on('data', (chunk: Buffer) => { raw += chunk.toString() })
        req.on('end', async () => {
          const reply = (status: number, body: unknown) => {
            res.statusCode = status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(body))
          }

          try {
            const { to, summary } = JSON.parse(raw || '{}') as { to?: string; summary?: string }

            if (!to || !summary) {
              reply(400, { error: 'Missing required fields: to, summary' })
              return
            }

            const from = process.env.SES_FROM_EMAIL
            if (!from) {
              reply(500, { error: 'Server misconfigured: SES_FROM_EMAIL missing' })
              return
            }

            const ses = new SESClient({
              region: process.env.AWS_REGION,
              credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
              },
            })

            const result = await ses.send(new SendEmailCommand({
              Source: from,
              Destination: { ToAddresses: [to] },
              Message: {
                Subject: { Data: 'Tu resumen de TODOs' },
                Body: { Text: { Data: summary } },
              },
            }))

            reply(200, { ok: true, messageId: result.MessageId })
          } catch (err: unknown) {
            const error = err as { name?: string; message?: string }
            console.error('[dev /api/send-email]', error?.name, error?.message)
            reply(500, { ok: false, error: error?.name ?? 'UnknownError', message: error?.message })
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), sendEmailDevPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.{ts,tsx}'],
  },
})

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

function buildHtmlBody(summary: string): string {
  const lines = summary.split("\n");
  const htmlLines = lines.map((line) => {
    if (line.startsWith("=")) return `<hr/>`;
    if (line.startsWith("Resumen de tareas")) return `<h2>${line}</h2>`;
    if (/^(Pendientes|Completadas)/.test(line)) return `<h3>${line}</h3>`;
    if (line.startsWith("  - ")) return `<li>${line.slice(4)}</li>`;
    if (line.startsWith("     ")) return `<p style="margin:0 0 4px 16px;color:#555">${line.trim()}</p>`;
    if (line.trim() === "(ninguna)") return `<li><em>ninguna</em></li>`;
    return line ? `<p>${line}</p>` : "";
  });

  return `
<!DOCTYPE html>
<html lang="es">
<body style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
  ${htmlLines.join("\n  ")}
</body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { to, summary } = req.body ?? {};

  if (!to || !summary) {
    return res.status(400).json({ error: "Missing required fields: to, summary" });
  }

  const from = process.env.SES_FROM_EMAIL;
  if (!from) {
    return res.status(500).json({ error: "Server misconfigured: SES_FROM_EMAIL missing" });
  }

  try {
    const command = new SendEmailCommand({
      Source: from,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: "Tu resumen de TODOs" },
        Body: {
          Text: { Data: summary },
          Html: { Data: buildHtmlBody(summary) },
        },
      },
    });

    const result = await ses.send(command);

    return res.status(200).json({ ok: true, messageId: result.MessageId });
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string };
    console.error("SES send error:", error?.name, error?.message);

    return res.status(500).json({
      ok: false,
      error: error?.name ?? "UnknownError",
      message: error?.message ?? "Failed to send email",
    });
  }
}

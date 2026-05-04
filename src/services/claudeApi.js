const MODEL = 'claude-sonnet-4-5'
const API_URL = 'https://api.anthropic.com/v1/messages'

const EXTRACTION_PROMPT = `Du bist ein Experte für Drehbuch-Analyse. Analysiere das beigefügte Drehbuch und extrahiere alle Szenen/Bilder.

Für jede Szene extrahiere:
- bildnummer: Die Szenennummer (z.B. "1", "42A", "VVP14"). Falls keine Nummer vorhanden, nummeriere fortlaufend ab 1.
- motiv: Drehort/Motiv als Kurzbezeichnung (z.B. "Wohnzimmer", "Straße", "Café")
- stimmung: Kombiniere Innen/Außen mit Tageszeit. Buchstaben: I = Innen/INT, A = Außen/EXT, T = Tag, N = Nacht, D = Dämmerung. Format: "I/T", "A/N", "I/D", "A/T" etc.
- synopsis: Was passiert in dieser Szene? (1-2 prägnante Sätze)
- rollen: Array mit Figurennamen die in der Szene auftreten

Wichtig: Erkenne auch Szenenköpfe wie "INT. ORT - TAG", "EXT. ORT - NACHT", "INNEN - ORT - ABEND" etc. in allen Sprachen.

Antworte NUR mit einem validen JSON-Objekt ohne Markdown-Formatierung, keine Backticks, keine Erklärungen:
{"szenen":[{"bildnummer":"1","motiv":"Wohnzimmer","stimmung":"I/T","synopsis":"Kurze Beschreibung.","rollen":["ANNA","BOB"]}]}`

function apiKey() {
  // Local: VITE_ANTHROPIC_API_KEY in .env  |  Vercel: ANTHROPIC_API_KEY (injected via vite define)
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('API-Key nicht gefunden. Bitte VITE_ANTHROPIC_API_KEY (lokal) oder ANTHROPIC_API_KEY (Vercel) setzen.')
  return key
}

export async function extractScenesFromPDF(pdfBase64, onProgress) {
  onProgress?.('Claude analysiert das Drehbuch…')

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey(),
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 16000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              },
            },
            {
              type: 'text',
              text: EXTRACTION_PROMPT,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `API-Fehler ${response.status}`)
  }

  const data = await response.json()
  const raw = data.content?.[0]?.text ?? ''

  // Strip any accidental markdown fences
  const clean = raw.replace(/```json?/g, '').replace(/```/g, '').trim()
  const jsonMatch = clean.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Claude hat kein valides JSON zurückgegeben.')

  const parsed = JSON.parse(jsonMatch[0])
  if (!Array.isArray(parsed.szenen)) throw new Error('Unerwartetes JSON-Format.')

  return parsed.szenen
}

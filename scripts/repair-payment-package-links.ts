/**
 * Repair script: vincula pagamentos históricos sem packageId aos seus pacotes.
 *
 * Contexto: antes do commit 9359ce3 (12/07/2026), createStudentPackageAction
 * criava pagamentos sem packageId. Este script tenta recuperar o vínculo
 * baseado em studentId + nº de aulas extraído da descrição.
 *
 * Uso: npx tsx scripts/repair-payment-package-links.ts
 * (adicione --dry-run para simular sem gravar)
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const DRY_RUN = process.argv.includes("--dry-run")

function extractLessons(desc: string): number | null {
  // "Pacote de 1,5 aulas" ou "Pacote de 2 aulas"
  const m = desc.match(/Pacote de ([0-9]+(?:[,\.][0-9]+)?) aulas/)
  if (!m) return null
  return parseFloat(m[1].replace(",", "."))
}

async function main() {
  console.log(`Modo: ${DRY_RUN ? "DRY-RUN (sem gravação)" : "LIVE (gravará no banco)"}\n`)

  // 1. Busca pagamentos sem packageId com descrição de pacote
  const unlinked = await prisma.payment.findMany({
    where: {
      packageId: null,
      description: { startsWith: "Pacote de " },
    },
    select: {
      id: true, studentId: true, description: true, dueDate: true,
      amount: true, installmentGroupId: true,
    },
  })

  console.log(`Pagamentos sem packageId com descrição "Pacote de...": ${unlinked.length}`)
  if (unlinked.length === 0) { console.log("Nada a reparar."); return }

  // 2. Busca todos os pacotes (sem pagamentos vinculados já)
  const packages = await prisma.lessonPackage.findMany({
    include: { payments: { select: { id: true } } },
  })

  const packageMap = new Map<string, typeof packages>() // key: "studentId:totalLessons"
  for (const pkg of packages) {
    const key = `${pkg.studentId}:${Number(pkg.totalLessons)}`
    if (!packageMap.has(key)) packageMap.set(key, [])
    packageMap.get(key)!.push(pkg)
  }

  // 3. Agrupa pagamentos por installmentGroupId (ou por id se avulso)
  const groups = new Map<string, typeof unlinked>()
  for (const p of unlinked) {
    const gkey = p.installmentGroupId ?? p.id
    if (!groups.has(gkey)) groups.set(gkey, [])
    groups.get(gkey)!.push(p)
  }

  let linked = 0
  let skipped = 0
  const toUpdate: { paymentId: string; packageId: string }[] = []

  for (const [, payments] of groups) {
    const first = payments[0]
    const lessons = extractLessons(first.description ?? "")
    if (lessons === null) { skipped++; continue }

    const key = `${first.studentId}:${lessons}`
    const candidates = packageMap.get(key) ?? []

    // Exclui pacotes que JÁ têm pagamentos vinculados
    const unlinkedPkgs = candidates.filter((p) => p.payments.length === 0)

    if (unlinkedPkgs.length === 0) {
      // Tenta pacotes com pagamentos — pode ser que já parte esteja vinculada
      const anyCandidates = candidates
      if (anyCandidates.length === 1) {
        // Único pacote desse tamanho → vincula mesmo que já tenha outros pagamentos
        const pkg = anyCandidates[0]
        for (const p of payments) toUpdate.push({ paymentId: p.id, packageId: pkg.id })
        console.log(`  ✓ [${first.studentId}] ${first.description} → pacote ${pkg.id} (único, já tem vínculos)`)
        linked++
      } else {
        console.log(`  ✗ [${first.studentId}] ${first.description} — nenhum pacote sem vínculo encontrado (${anyCandidates.length} candidatos)`)
        skipped++
      }
      continue
    }

    if (unlinkedPkgs.length === 1) {
      const pkg = unlinkedPkgs[0]
      for (const p of payments) toUpdate.push({ paymentId: p.id, packageId: pkg.id })
      console.log(`  ✓ [${first.studentId}] ${first.description} → pacote ${pkg.id}`)
      linked++
    } else {
      // Múltiplos pacotes sem vínculo do mesmo tamanho para este aluno
      // Escolhe o mais próximo pela data de aquisição vs vencimento do 1º pagamento
      const closest = unlinkedPkgs.sort((a, b) =>
        Math.abs(a.purchaseDate.getTime() - first.dueDate.getTime()) -
        Math.abs(b.purchaseDate.getTime() - first.dueDate.getTime())
      )[0]
      for (const p of payments) toUpdate.push({ paymentId: p.id, packageId: closest.id })
      console.log(`  ✓ [${first.studentId}] ${first.description} → pacote ${closest.id} (escolhido por proximidade de data entre ${unlinkedPkgs.length} candidatos)`)
      linked++
    }
  }

  console.log(`\nResumo: ${linked} grupos a vincular, ${skipped} ignorados, ${toUpdate.length} payments a atualizar`)

  if (DRY_RUN) {
    console.log("\nDRY-RUN: nenhum dado foi alterado. Rode sem --dry-run para aplicar.")
    return
  }

  if (toUpdate.length === 0) {
    console.log("Nada a atualizar.")
    return
  }

  // 4. Aplica em lote (chunks de 50 para não estourar conexão)
  const CHUNK = 50
  for (let i = 0; i < toUpdate.length; i += CHUNK) {
    const chunk = toUpdate.slice(i, i + CHUNK)
    await prisma.$transaction(
      chunk.map(({ paymentId, packageId }) =>
        prisma.payment.update({ where: { id: paymentId }, data: { packageId } })
      )
    )
  }

  console.log(`\n✅ ${toUpdate.length} pagamentos vinculados com sucesso.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

/**
 * `items.map(fn)` com no máximo `limit` chamadas em andamento ao mesmo tempo.
 *
 * Feito para envios (e-mail/WhatsApp): em fila, um a um, 30 avisos levavam 30×
 * o tempo de um; tudo de uma vez arrisca bloqueio por excesso na Z-API. Os
 * resultados voltam NA ORDEM DE ENTRADA. Se alguma chamada falhar, a promessa
 * rejeita com esse erro (como o laço sequencial fazia), mas as que já estavam
 * em andamento terminam.
 */
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0
  let failed = false

  async function worker() {
    while (!failed && next < items.length) {
      const i = next++
      try {
        results[i] = await fn(items[i], i)
      } catch (e) {
        failed = true
        throw e
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker)
  await Promise.all(workers)
  return results
}

/** Quantos envios externos simultâneos permitimos (e-mail + WhatsApp por item). */
export const SEND_CONCURRENCY = 5

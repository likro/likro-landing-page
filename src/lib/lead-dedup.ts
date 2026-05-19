/**
 * Dedup window in-memory para /api/lead.
 *
 * Limitação aceita v1: Map vive por instance da edge function.
 * Spans multi-instance NÃO são dedupadas. Pior caso v1: Lenny recebe
 * 2 emails do mesmo lead. Promover para Upstash KV se virar problema real.
 *
 * Caller responsabilidade: normalizar o número ANTES de chamar.
 */

const WINDOW_MS = 60_000;
const dedup = new Map<string, number>();

/**
 * Retorna `true` se o número já foi registrado dentro da janela de 60s
 * (caller deve tratar como "duplicate, return fake success").
 * Retorna `false` se novo (e registra agora).
 *
 * Faz cleanup oportunista de entradas expiradas a cada chamada — evita
 * memory leak em instance long-lived sem precisar de timer/cron.
 */
export function checkAndRegisterDedup(normalizedPhone: string): boolean {
  const now = Date.now();

  // Cleanup oportunista — O(n) no tamanho atual do Map, irrelevante v1
  for (const [k, ts] of dedup) {
    if (now - ts > WINDOW_MS) dedup.delete(k);
  }

  const existing = dedup.get(normalizedPhone);
  if (existing !== undefined && now - existing < WINDOW_MS) {
    return true; // duplicate
  }
  dedup.set(normalizedPhone, now);
  return false;
}

/** Test-only: reset interno entre testes. NÃO chamar em produção. */
export function __resetDedupForTests(): void {
  dedup.clear();
}

/** Test-only: inspecionar estado interno. */
export function __getDedupSizeForTests(): number {
  return dedup.size;
}

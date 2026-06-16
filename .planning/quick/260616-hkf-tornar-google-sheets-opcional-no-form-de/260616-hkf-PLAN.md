---
phase: quick-260616-hkf
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/server-env.ts
  - src/lib/lead-sheets.ts
  - tests/lib/server-env.test.ts
autonomous: true
requirements:
  - SHEETS-OPT-01
  - SHEETS-OPT-02
  - SHEETS-OPT-03
  - SHEETS-OPT-04
must_haves:
  truths:
    - "Com só RESEND_API_KEY + LEAD_TO_EMAIL setadas (zero vars Google), o form entrega por email e a rota devolve 200"
    - "Com as 3 vars Google ausentes, appendLeadRow faz no-op silencioso — sem validar, sem fetch, sem log de erro"
    - "Com as 3 vars Google presentes, o append no Sheets funciona como hoje"
    - "Com 1 ou 2 das 3 vars Google presentes (config parcial), o append lança erro claro de misconfiguração — mas Resend ainda entrega e a rota devolve 200"
    - "lead-resend.ts não dispara validação de nenhuma var do Google"
  artifacts:
    - path: "src/lib/server-env.ts"
      provides: "Validação de vars obrigatórias (Resend) separada das opcionais (Google), com helper de estado do Sheets"
      contains: "getGoogleEnv"
    - path: "src/lib/lead-sheets.ts"
      provides: "appendLeadRow com gate de habilitação do Sheets"
      contains: "getGoogleEnv"
    - path: "tests/lib/server-env.test.ts"
      provides: "Cobertura dos 3 estados (off / on / parcial) do gate Google"
  key_links:
    - from: "src/lib/lead-resend.ts"
      to: "src/lib/server-env.ts"
      via: "serverEnv.RESEND_API_KEY / serverEnv.LEAD_TO_EMAIL (só vars obrigatórias)"
      pattern: "serverEnv\\.(RESEND_API_KEY|LEAD_TO_EMAIL)"
    - from: "src/lib/lead-sheets.ts"
      to: "src/lib/server-env.ts"
      via: "getGoogleEnv() retorna null quando Sheets off, throw quando parcial"
      pattern: "getGoogleEnv"
---

<objective>
Tornar a entrega via Google Sheets OPCIONAL no form de leads. Hoje `serverEnv`
(Proxy lazy) valida as 5 vars de uma vez na primeira leitura. Como `sendLeadEmail`
lê `serverEnv.RESEND_API_KEY`, ele dispara a validação do schema inteiro — então,
sem as vars do Google, até o envio por Resend quebra e a rota devolve 502.

Este plano separa as vars obrigatórias (Resend) das opcionais (Google), faz o
append no Sheets ser gated por um helper de estado, e mantém o caminho feliz
Resend-only 100% funcional (200, sem promise rejeitada barulhenta).

Purpose: permitir lançar o form com entrega só por email, sem exigir setup do Sheets.
Output: server-env com gate Google + lead-sheets com no-op gracioso + testes dos 3 estados.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@./CLAUDE.md
@src/lib/server-env.ts
@src/lib/lead-sheets.ts
@src/lib/lead-resend.ts
@src/app/api/lead/route.ts

<interfaces>
<!-- Contratos atuais que os executores precisam preservar. -->

server-env.ts exporta hoje:
```typescript
export function getServerEnv(): ServerEnv;   // valida as 5 vars juntas
export const serverEnv: ServerEnv;           // Proxy lazy sobre getServerEnv()
```

lead-resend.ts consome (NÃO pode mudar de comportamento):
```typescript
const resend = new Resend(serverEnv.RESEND_API_KEY);
await resend.emails.send({ to: serverEnv.LEAD_TO_EMAIL, ... });
```

lead-sheets.ts consome hoje (3 acessos a vars Google via Proxy `serverEnv`):
```typescript
serverEnv.GOOGLE_SA_PRIVATE_KEY  // em getAccessToken()
serverEnv.GOOGLE_SA_CLIENT_EMAIL // em getAccessToken()
serverEnv.GOOGLE_SHEET_ID        // em appendLeadRow()
```

route.ts orquestra (NÃO muda neste plano):
```typescript
const [emailResult, sheetResult] = await Promise.allSettled([
  sendLeadEmail(lead), appendLeadRow(lead),
]);
// 200 se emailOK || sheetOK; 502 se ambos falham; loga reason de cada falha.
```

vitest.config.ts: environment jsdom, globals: true, alias "@" → ./src.
Edge runtime na route — proibido dep Node-only.
</interfaces>

<design_decision>
**Regra do caso parcial (1 ou 2 das 3 vars Google presentes):**
É quase sempre erro de config (operador setou metade). Esconder isso como
"Sheets off" silencioso é PERIGOSO — o operador acha que configurou e não
configurou. Regra adotada:

- 0/3 presentes → Sheets DESABILITADO → `getGoogleEnv()` retorna `null` →
  `appendLeadRow` faz no-op silencioso (sem validar, sem fetch, sem log).
- 3/3 presentes → Sheets HABILITADO → comportamento atual mantido.
- 1 ou 2 de 3 → MISCONFIGURADO → `getGoogleEnv()` faz `throw` com mensagem
  listando quais faltam. Como `appendLeadRow` roda dentro de `Promise.allSettled`
  na route, esse throw NÃO derruba a entrega: Resend ainda entrega, a rota
  devolve 200, e a route loga `[lead] sheets failed: ...` com a mensagem clara.
  Resultado: operador percebe o erro nos logs, mas leads não são perdidos.

Isso satisfaz "falhar claro" sem quebrar o caminho feliz.
</design_decision>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Separar schema obrigatório do opcional Google em server-env.ts</name>
  <files>src/lib/server-env.ts</files>
  <behavior>
    - getServerEnv() valida APENAS RESEND_API_KEY + LEAD_TO_EMAIL (não mais as 5).
    - serverEnv (Proxy) cobre só os 2 campos obrigatórios — acessar RESEND_API_KEY
      nunca dispara validação de var Google.
    - getGoogleEnv() retorna { clientEmail, privateKey, sheetId } quando as 3 estão presentes.
    - getGoogleEnv() retorna null quando as 3 estão ausentes/vazias (Sheets off).
    - getGoogleEnv() faz throw com mensagem listando as faltantes quando 1 ou 2 (de 3) presentes.
  </behavior>
  <action>
Refatorar `src/lib/server-env.ts`:

1. Trocar o `schema` único por um schema só das obrigatórias:
   ```typescript
   const requiredSchema = z.object({
     RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY ausente"),
     LEAD_TO_EMAIL: z.string().email("LEAD_TO_EMAIL deve ser email válido"),
   });
   type ServerEnv = z.infer<typeof requiredSchema>;
   ```
   `getServerEnv()` passa a validar só `RESEND_API_KEY` + `LEAD_TO_EMAIL`
   (remover as 3 vars Google do `safeParse`). Manter o cache, o Proxy `serverEnv`
   e a mensagem de erro lazy idênticos em estilo. Atualizar o JSDoc do topo
   mencionando que as vars Google são agora opcionais e validadas à parte.

2. Adicionar o helper de estado do Google (também lazy + cacheado):
   ```typescript
   export interface GoogleEnv {
     clientEmail: string;
     privateKey: string;
     sheetId: string;
   }

   let googleCached: GoogleEnv | null | undefined; // undefined = ainda não resolvido

   /**
    * Estado do Sheets:
    *  - null  → 3 vars ausentes → Sheets desabilitado (caller faz no-op).
    *  - GoogleEnv → 3 vars presentes → Sheets habilitado.
    *  - throw → config parcial (1 ou 2 de 3) → erro claro listando faltantes.
    */
   export function getGoogleEnv(): GoogleEnv | null {
     if (googleCached !== undefined) return googleCached;

     const clientEmail = process.env.GOOGLE_SA_CLIENT_EMAIL?.trim() ?? "";
     const privateKey = process.env.GOOGLE_SA_PRIVATE_KEY?.trim() ?? "";
     const sheetId = process.env.GOOGLE_SHEET_ID?.trim() ?? "";

     const present = [clientEmail, privateKey, sheetId].filter(Boolean).length;

     if (present === 0) {
       googleCached = null; // Sheets desabilitado
       return googleCached;
     }
     if (present === 3) {
       googleCached = { clientEmail, privateKey, sheetId };
       return googleCached;
     }
     // 1 ou 2 → config parcial → erro claro (NÃO cacheia; deixa o caller decidir)
     const missing = [
       !clientEmail && "GOOGLE_SA_CLIENT_EMAIL",
       !privateKey && "GOOGLE_SA_PRIVATE_KEY",
       !sheetId && "GOOGLE_SHEET_ID",
     ].filter(Boolean);
     throw new Error(
       `[server-env] config parcial do Google Sheets — defina todas as 3 vars ou nenhuma. ` +
         `Faltando: ${missing.join(", ")}.`,
     );
   }
   ```
   Importante: o caso parcial NÃO deve cachear (mantém `googleCached` como
   `undefined`) para que correções de env durante dev sejam reavaliadas.

3. Adicionar test-only reset para isolar testes:
   ```typescript
   /** Test-only: limpa caches internos entre testes. */
   export function __resetServerEnvForTests(): void {
     cached = null;
     googleCached = undefined;
   }
   ```
   (Renomear/expor `cached` se necessário — manter privado ao módulo.)

NÃO mexer em `lead-resend.ts`: ele continua lendo `serverEnv.RESEND_API_KEY` e
`serverEnv.LEAD_TO_EMAIL`, que agora pertencem ao schema enxuto — logo nunca toca
em var Google. Verificar com grep que lead-resend só referencia essas duas.
  </action>
  <verify>
    <automated>npm run typecheck</automated>
  </verify>
  <done>getServerEnv valida só 2 vars; getGoogleEnv exportado com semântica null/objeto/throw; __resetServerEnvForTests exportado; typecheck verde; grep confirma que lead-resend.ts não referencia GOOGLE_*.</done>
</task>

<task type="auto">
  <name>Task 2: Gate de habilitação do Sheets em lead-sheets.ts</name>
  <files>src/lib/lead-sheets.ts</files>
  <action>
Refatorar `src/lib/lead-sheets.ts` para consumir `getGoogleEnv()` em vez de ler
vars Google direto do Proxy `serverEnv`:

1. Trocar o import:
   ```typescript
   import { getGoogleEnv, type GoogleEnv } from "@/lib/server-env";
   ```
   (remover o import de `serverEnv` se ele não for mais usado neste arquivo).

2. `appendLeadRow(lead)` passa a fazer o gate logo no início:
   ```typescript
   export async function appendLeadRow(lead: Lead): Promise<void> {
     const google = getGoogleEnv(); // null = off; throw = config parcial
     if (google === null) {
       return; // Sheets desabilitado — no-op silencioso (sem fetch, sem log)
     }
     const token = await getAccessToken(google);
     const url =
       `https://sheets.googleapis.com/v4/spreadsheets/${google.sheetId}` +
       `/values/${encodeURIComponent(RANGE)}:append?valueInputOption=RAW`;
     // ... resto igual (montagem da row + fetch + checagem de res.ok)
   }
   ```
   Atenção: o `throw` do caso parcial propaga de `getGoogleEnv()` para cima —
   como a route chama dentro de `Promise.allSettled`, isso vira `rejected`
   (loga "[lead] sheets failed: ..." e a rota ainda devolve 200 via Resend).
   Comportamento desejado — NÃO capturar o throw aqui.

3. `getAccessToken` passa a receber `google: GoogleEnv` como argumento, em vez
   de ler do Proxy:
   ```typescript
   async function getAccessToken(google: GoogleEnv): Promise<string> {
     const privateKeyPem = google.privateKey.replace(/\\n/g, "\n");
     const privateKey = await importPKCS8(privateKeyPem, "RS256");
     // ...
     .setIssuer(google.clientEmail)
     // ...
   }
   ```

Preservar: import `"server-only"`, jose (`SignJWT`/`importPKCS8`), Pitfall 1
(unescape `\\n`), constantes SCOPES/TOKEN_URL/RANGE, formato da row, e toda a
lógica de fetch/erro. Edge runtime — sem dep Node-only nova.
  </action>
  <verify>
    <automated>npm run typecheck</automated>
  </verify>
  <done>appendLeadRow faz no-op quando getGoogleEnv() é null; getAccessToken recebe GoogleEnv; nenhuma referência a serverEnv.GOOGLE_* sobra no arquivo; typecheck verde.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Testes dos 3 estados do gate Google</name>
  <files>tests/lib/server-env.test.ts</files>
  <behavior>
    - Estado OFF (0/3 vars Google, mas Resend setado): getGoogleEnv() === null; getServerEnv() resolve sem throw.
    - Estado ON (3/3 vars Google): getGoogleEnv() retorna { clientEmail, privateKey, sheetId } com os valores.
    - Estado PARCIAL (ex.: só GOOGLE_SHEET_ID): getGoogleEnv() lança Error mencionando as vars faltantes.
    - getServerEnv() lança quando RESEND_API_KEY ou LEAD_TO_EMAIL faltam.
    - getServerEnv() NÃO depende de var Google (resolve com Google 100% ausente).
  </behavior>
  <action>
Criar `tests/lib/server-env.test.ts` (vitest, segue o padrão de tests/lib/*.test.ts).

Como `server-env.ts` importa `"server-only"`, mocká-lo no topo:
```typescript
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
vi.mock("server-only", () => ({}));
```

Padrão de isolamento por teste (env é process-global + módulo cacheia):
```typescript
import {
  getServerEnv,
  getGoogleEnv,
  __resetServerEnvForTests,
} from "@/lib/server-env";

const OG = { ...process.env };
beforeEach(() => {
  __resetServerEnvForTests();
  // limpa todas as 5 vars relevantes
  delete process.env.RESEND_API_KEY;
  delete process.env.LEAD_TO_EMAIL;
  delete process.env.GOOGLE_SA_CLIENT_EMAIL;
  delete process.env.GOOGLE_SA_PRIVATE_KEY;
  delete process.env.GOOGLE_SHEET_ID;
});
afterEach(() => {
  process.env = { ...OG };
});
```

Casos a cobrir:
1. **Resend-only (Google off):** setar RESEND_API_KEY + LEAD_TO_EMAIL válidos →
   `expect(() => getServerEnv()).not.toThrow()` e `expect(getGoogleEnv()).toBeNull()`.
2. **Google completo:** setar as 3 vars Google → `getGoogleEnv()` retorna objeto
   com clientEmail/privateKey/sheetId corretos (`toEqual`).
3. **Google parcial:** setar só GOOGLE_SHEET_ID →
   `expect(() => getGoogleEnv()).toThrow(/GOOGLE_SA_CLIENT_EMAIL/)` e que a mensagem
   também cita GOOGLE_SA_PRIVATE_KEY.
4. **Obrigatória faltando:** sem RESEND_API_KEY →
   `expect(() => getServerEnv()).toThrow(/RESEND_API_KEY/)`.

Usar valores fake plausíveis (LEAD_TO_EMAIL = "ops@likro.com.br",
GOOGLE_SA_CLIENT_EMAIL = "sa@proj.iam.gserviceaccount.com", etc.).
  </action>
  <verify>
    <automated>npm run test -- server-env</automated>
  </verify>
  <done>Suite tests/lib/server-env.test.ts passa cobrindo os 3 estados + var obrigatória faltando; npm run test (suite inteira) verde; npm run typecheck verde.</done>
</task>

</tasks>

<verification>
- `npm run typecheck` verde (sem erro de tipo após separar schemas e mudar assinatura de getAccessToken).
- `npm run test` verde (suite nova de server-env + suites existentes utils/analytics intactas).
- Grep manual: `lead-resend.ts` não contém `GOOGLE_`; `lead-sheets.ts` não contém `serverEnv.GOOGLE_`.
- Smoke conceitual da route (sem rodar): com Google off, `Promise.allSettled` →
  emailResult fulfilled, sheetResult fulfilled (no-op) → 200, nenhum console.error.
</verification>

<success_criteria>
- RESEND_API_KEY + LEAD_TO_EMAIL continuam obrigatórios (validados em getServerEnv).
- As 3 vars Google são opcionais; 0/3 = no-op silencioso; 3/3 = comportamento atual; 1-2/3 = throw claro (entrega Resend preservada via allSettled).
- lead-resend.ts não depende de nenhuma var Google.
- Sem mudança de UX; edge runtime mantido (jose + fetch, zero dep Node-only).
- Caminho feliz Resend-only devolve 200 sem promise rejeitada barulhenta nem console.error.
</success_criteria>

<output>
After completion, create `.planning/quick/260616-hkf-tornar-google-sheets-opcional-no-form-de/260616-hkf-SUMMARY.md`
</output>

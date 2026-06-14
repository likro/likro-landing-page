import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Phase 3 — Hero LCP + Copy invariants (Wave 0 grep gates).
 *
 * These tests guard the Hero section against the exact regressions that would
 * silently kill the Lighthouse mobile LCP target (HERO-02 / HERO-04 / HERO-05),
 * the brand voice (COPY-01 / COPY-02), and the storage convention for copy
 * (everything in src/content/hero.ts, never inlined in JSX).
 *
 * Node-puro fs + regex, no dependency on shell `grep` — cross-platform by
 * design (Windows / macOS / Linux). Patterned after tests/brand-lock.test.ts.
 *
 * Strategy: each invariant skips silently (returns empty match list) when the
 * Hero files don't exist yet. This lets Plan 01 land this file BEFORE Plan 02
 * builds the Hero section. The tests start failing the moment Plan 02 violates
 * any invariant in src/sections/Hero/ or src/components/layout/Header.tsx.
 *
 * Canary strings the COPY-01 detectors MUST flag once they appear inside JSX
 * of src/sections/Hero/*.tsx or src/components/layout/Header.tsx (sanity check
 * for the regex design — if any of these slip past in a real PR, regex is wrong):
 *   - <p>Lead que chegou pelo Instagram, conversa no WhatsApp, agendamento — a sua clínica organizada.</p>
 *   - <span>Atendendo agora · 2 atendentes online</span>
 *   - <h1>A operação da sua clínica, em um só lugar.</h1>
 */

const SRC_DIR = path.resolve(__dirname, "../../src");
const HERO_DIR = path.resolve(SRC_DIR, "sections/Hero");
const HEADER_FILE = path.resolve(SRC_DIR, "components/layout/Header.tsx");
const HERO_COPY_FILE = path.resolve(SRC_DIR, "content/hero.ts");
const HERO_MOCKUP_FILE = path.resolve(SRC_DIR, "sections/Hero/HeroMockup.tsx");

const TSX_EXTS = new Set([".tsx", ".ts"]);

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (TSX_EXTS.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function heroAndHeaderFiles(): string[] {
  return [...walk(HERO_DIR), ...(fs.existsSync(HEADER_FILE) ? [HEADER_FILE] : [])];
}

/** Read file and split into lines for line-number-aware violation reporting. */
function readLines(file: string): string[] {
  return fs.readFileSync(file, "utf-8").split(/\r?\n/);
}

/** Strip JSX attribute strings (aria-label, title, alt, etc.) before COPY-01 regex match. */
function stripCopyAllowlist(line: string): string {
  // Drop the whole line if it's a JSX comment or contains an a11y attribute string.
  if (/\{\/\*[\s\S]*?\*\/\}/.test(line)) return "";
  if (/\b(aria-label|aria-description|aria-labelledby|title|alt|placeholder|name)=["']/.test(line))
    return "";
  return line;
}

describe("hero invariants — Phase 3 LCP + copy gates", () => {
  // -------------------------------------------------------------------------
  // Test 1 — no entrance-animation props on Hero/Header LCP (HERO-02, v2.0)
  // -------------------------------------------------------------------------
  // v2.0 (milestone Hero Travessia): o Hero AGORA é a travessia de luz dirigida
  // por scroll — `motion.*` é ESPERADO e permitido. O que ainda mata o LCP é
  // animação de ENTRADA no H1/sub/CTA (fade/slide-in no mount ou ao entrar na
  // viewport). Então banimos as props de entrada (`initial`, `animate`,
  // `whileInView`) em Hero/Header. `style={{ ... }}` scroll-bound (useTransform,
  // identidade em progress 0) é OK — o H1 renderiza em opacidade plena no SSR.
  // A lookbehind (?<![\w-]) evita falso-positivo em `data-animate`/`data-hidden`.
  it("no entrance-animation props (initial/animate/whileInView) in Hero or Header — LCP renders static (HERO-02)", () => {
    const files = heroAndHeaderFiles();
    // Match a FORMA de prop JSX de entrada: `initial={…}`, `animate="…"`,
    // `whileInView='…'`, `variants={…}` (propagação de variant também anima a
    // entrada do elemento). Tolera espaço (`animate ={{…}}`) e exige `=` seguido de
    // `{`/`"`/`'` — evita prosa em comentários (ex: `animate=false`).
    const entranceRegex = /(?<![\w-])(initial|animate|whileInView|variants)\s*=\s*["'{]/g;

    const violations: string[] = [];
    for (const file of files) {
      const lines = readLines(file);
      lines.forEach((line, idx) => {
        const m = line.match(entranceRegex);
        if (m) {
          violations.push(
            `${path.relative(SRC_DIR, file)}:${idx + 1}: ${m.join(", ")} — ${line.trim()}`,
          );
        }
      });
    }
    expect(
      violations,
      `HERO-02 violation: props de entrada (initial/animate/whileInView) em Hero/Header ` +
        `animariam o elemento LCP no mount/scroll-into-view, atrasando o LCP percebido. ` +
        `A travessia v2.0 dirige motion só por 'style' scroll-bound (useTransform, ` +
        `identidade em repouso); o H1/sub/CTA devem renderizar no estado final em SSR.\n` +
        `Found entrance props:\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Test 2 — zero `vh` height in Hero/ and Header (HERO-05)
  // -------------------------------------------------------------------------
  it("zero raw `vh` height utilities in src/sections/Hero/ or src/components/layout/Header.tsx (HERO-05)", () => {
    const files = heroAndHeaderFiles();
    // Catch `h-screen`, `min-h-screen`, `max-h-screen`, and any arbitrary 100vh.
    // Allow `dvh` / `svh` / `lvh` (the dynamic viewport units we WANT).
    const vhRegex = /\b(?:min-h|h|max-h)-\[?100vh\]?\b|\bh-screen\b|\bmin-h-screen\b|\bmax-h-screen\b/g;

    const violations: string[] = [];
    for (const file of files) {
      const lines = readLines(file);
      lines.forEach((line, idx) => {
        const m = line.match(vhRegex);
        if (m) {
          violations.push(
            `${path.relative(SRC_DIR, file)}:${idx + 1}: ${m.join(", ")} — ${line.trim()}`,
          );
        }
      });
    }
    expect(
      violations,
      `HERO-05 violation: Hero MUST use 'dvh' or 'svh' for height (iOS address-bar safe), NEVER 'vh'/'h-screen'.\n` +
        `Use 'min-h-svh' (preferred) or 'min-h-dvh' instead.\n` +
        `Found vh usage:\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Test 3 — exactly 1 (or ≤1 before Plan 02) `<Image ... priority>` in src/
  // -------------------------------------------------------------------------
  it("exactly 1 `priority` in `.tsx` files of src/ once HeroMockup.tsx exists (HERO-04)", () => {
    // We scan .tsx files only — this excludes src/app/sitemap.ts whose
    // `priority: 1` is a MetadataRoute.Sitemap literal (false-positive avoided).
    const files = walk(SRC_DIR).filter((f) => f.endsWith(".tsx"));

    // Match `priority` as a JSX prop boundary: `<Image priority />`, `<Image priority>`,
    // `priority\n>` (multi-line), or `priority={true}`. The lookahead constrains it
    // to a JSX-close context to avoid catching `priority: 1` in object literals.
    const priorityRegex = /\bpriority\b(?=\s*(?:\}|\/|>|=\s*\{))/g;

    const matches: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const found = content.match(priorityRegex);
      if (found) {
        // Skip the `priority={false}` case which is allowed everywhere.
        const lines = readLines(file);
        lines.forEach((line, idx) => {
          if (priorityRegex.test(line) && !/priority=\{false\}/.test(line)) {
            matches.push(`${path.relative(SRC_DIR, file)}:${idx + 1}: ${line.trim()}`);
          }
          priorityRegex.lastIndex = 0; // reset stateful regex
        });
      }
    }

    const count = matches.length;
    const heroMockupExists = fs.existsSync(HERO_MOCKUP_FILE);

    if (heroMockupExists) {
      expect(
        count,
        `HERO-04 STRICT gate: HeroMockup.tsx exists → priority count MUST === 1 ` +
          `(the single LCP <Image priority> is the hero mockup).\n` +
          `Found ${count}:\n${matches.join("\n")}`,
      ).toBe(1);
    } else {
      expect(
        count,
        `HERO-04 pre-Plan-02 gate: priority count MUST be ≤ 1 before HeroMockup.tsx exists.\n` +
          `Found ${count}:\n${matches.join("\n")}`,
      ).toBeLessThanOrEqual(1);
    }
  });

  // -------------------------------------------------------------------------
  // Test 4 — zero PT-BR sentence-like strings hard-coded in Hero/Header JSX (COPY-01)
  // -------------------------------------------------------------------------
  it("zero PT-BR sentence-like strings hard-coded in Hero/Header JSX — copy belongs in src/content/hero.ts (COPY-01)", () => {
    const files = heroAndHeaderFiles();

    // Detector A: text between JSX tags containing ≥2 PT accented vowels — captures clearly PT-BR sentences.
    const HARDCODED_PT_ACCENTED = />\s*[^<{}]*?(?:[áàâãéêíóôõúç][^<{}]*?){2,}<\/[a-z]/gi;
    // Detector B: text between JSX tags ≥3 words and ≥30 chars — captures long PT-BR text that may lack accents.
    const HARDCODED_PT_LONG =
      />\s*[A-ZÀ-Úa-zà-ú][^<{}]*?\s+[a-zà-ú]+\s+[a-zà-ú]+[^<{}]{15,}?<\/[a-z]/gi;

    const violations: string[] = [];
    for (const file of files) {
      const lines = readLines(file);
      lines.forEach((line, idx) => {
        const stripped = stripCopyAllowlist(line);
        if (!stripped) return;
        const a = stripped.match(HARDCODED_PT_ACCENTED);
        const b = stripped.match(HARDCODED_PT_LONG);
        const matches = [...(a ?? []), ...(b ?? [])];
        if (matches.length > 0) {
          violations.push(
            `${path.relative(SRC_DIR, file)}:${idx + 1}: ${line.trim().slice(0, 160)}`,
          );
        }
      });
    }

    expect(
      violations,
      `COPY-01 violation: PT-BR copy MUST live in 'src/content/hero.ts', not inlined in JSX.\n` +
        `Move these strings to content/hero.ts and import them in the component:\n${violations.join(
          "\n",
        )}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Test 5 — zero "cara de IA" banned phrases in src/content/hero.ts (COPY-02)
  // -------------------------------------------------------------------------
  it.skipIf(!fs.existsSync(HERO_COPY_FILE))(
    "zero 'cara de IA' banned phrases in src/content/hero.ts (COPY-02 — Pitfall A)",
    () => {
      const content = fs.readFileSync(HERO_COPY_FILE, "utf-8");
      const BANNED =
        /\b(desbloqueie|desbloque|potencialize|potencia|transforme sua|próximo nível|proximo nivel|solução inovadora|solucao inovadora|jornada do cliente|do início ao fim|do inicio ao fim|feito para você|feito para voce|leve seu? .+ a outro patamar|revolucione|empodere)\b/gi;
      const found = content.match(BANNED) ?? [];
      expect(
        found,
        `COPY-02 violation: hero.ts contém frases banidas "cara de IA" (Pitfall A).\n` +
          `Reescrever em voz humana, direta, sem buzzwords SaaS.\n` +
          `Matches:\n${found.join(", ")}`,
      ).toEqual([]);
    },
  );

  // -------------------------------------------------------------------------
  // Bonus: smoke test that the helper handles missing directory gracefully.
  // Without this, a regression in `walk()` could silently turn all gates into
  // no-ops (the worst kind of green test).
  // -------------------------------------------------------------------------
  it("walk() returns [] for nonexistent directory (helper sanity check)", () => {
    const ghost = path.resolve(SRC_DIR, "this/dir/does/not/exist");
    expect(walk(ghost)).toEqual([]);
  });
});

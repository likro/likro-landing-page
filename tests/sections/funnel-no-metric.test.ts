import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Phase 9 / Plan 09-01 — Funnel no-metric audit (FUNIL-02).
 *
 * 09-CONTEXT D-3: PROIBIDO em toda a seção qualquer número, KPI, %, gráfico,
 * taxa de conversão, contador ou widget de dashboard. Se aparecer métrica, o
 * capítulo vira CRM genérico e perde a força.
 *
 * Scope: walk src/sections/Funnel/** AND read src/content/funnel.ts.
 *
 * CRITICAL ALLOWLIST — appointment time token: the human appointment time
 * `\d{1,2}h` (e.g. "14h") is an ALLOWED appointment time per UI-SPEC / CONTEXT
 * D-3, NEVER a metric. It appears in BOTH beat-3 ("...escolheu quinta às 14h
 * entre os horários livres.") and the seal ("Consulta confirmada · quinta,
 * 14h"), and could recur in the section JSX. So BEFORE any digit/`%` scan we
 * strip EVERY occurrence of `/\d{1,2}h/gi` from the scanned corpus GLOBALLY —
 * not just from the seal substring. Treating any of those `14h` digits as a
 * metric would turn this audit red on LOCKED copy.
 *
 * The section dir is absent pre-build (walk → []) and funnel.ts's only digits
 * are allowlisted times, so this test PASSES now and KEEPS passing after Plan
 * 02 lands the section (assuming the section adds no real metrics).
 *
 * Comments are stripped before scanning: the audit targets RENDERED copy/JSX,
 * not documentation. funnel.ts's JSDoc legitimately *names* the forbidden
 * terms ("KPI", "dashboard", "gráfico", "métrica") to document D-3 — those are
 * doc, never DOM, so they must not trip the audit.
 */

const SRC_DIR = path.resolve(__dirname, "../../src");
const FUNNEL_DIR = path.resolve(SRC_DIR, "sections/Funnel");
const FUNNEL_CONTENT = path.resolve(SRC_DIR, "content/funnel.ts");

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

function scannedFiles(): string[] {
  const files = walk(FUNNEL_DIR);
  if (fs.existsSync(FUNNEL_CONTENT)) files.push(FUNNEL_CONTENT);
  return files;
}

// Strip comments before scanning — the audit targets rendered copy/JSX, not
// documentation. The JSDoc in funnel.ts legitimately names forbidden terms.
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, " ") // block comments (incl. JSDoc)
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 "); // line comments (avoid http://)
}

// Appointment-time allowlist applied GLOBALLY to the corpus before the metric
// scan. `\d{1,2}h` (e.g. "14h") is a human appointment time, never a metric.
const APPOINTMENT_TIME_REGEX = /\d{1,2}h/gi;

// Metric term patterns (FUNIL-02). Whole-token where sensible, case-insensitive.
const METRIC_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: "KPI", re: /\bKPI\b/i },
  { name: "taxa de conversão", re: /taxa de convers/i },
  { name: "conversão/conversao", re: /\bconvers[ãa]o\b/i },
  { name: "dashboard", re: /\bdashboard\b/i },
  { name: "gráfico/grafico", re: /\bgr[áa]fico\b/i },
  { name: "métrica/metrica", re: /\bm[ée]trica\b/i },
  { name: "percent sign", re: /%/ },
  { name: "digit followed by %", re: /\d\s*%/ },
  { name: "X de Y counter", re: /\b\d+\s+de\s+\d+\b/i },
];

describe("funnel no-metric audit — Phase 9 / Plan 09-01 (FUNIL-02)", () => {
  it("zero metric/KPI/%/dashboard/counter terms in Funnel section + content (FUNIL-02)", () => {
    const files = scannedFiles();

    const violations: string[] = [];
    for (const file of files) {
      const raw = fs.readFileSync(file, "utf-8");
      // 1) Strip comments (doc, never DOM). 2) Strip the appointment-time token
      // GLOBALLY before any digit/% scan so the LOCKED "14h" times never read
      // as metrics.
      const corpus = stripComments(raw).replace(APPOINTMENT_TIME_REGEX, " ");
      for (const { name, re } of METRIC_PATTERNS) {
        const m = corpus.match(re);
        if (m) {
          violations.push(`${path.relative(SRC_DIR, file)}: [${name}] "${m[0]}"`);
        }
      }
    }

    expect(
      violations,
      `FUNIL-02 violation: no metric/KPI/%/conversion/dashboard/chart/counter terms allowed ` +
        `in the Funnel chapter (09-CONTEXT D-3). The appointment time "14h" is allowlisted and ` +
        `must NOT trigger this audit.\nViolations:\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  it("appointment-time allowlist is global (strips every \\d{1,2}h, not just the seal)", () => {
    // Guard against regressing the allowlist into a one-off seal-substring hack.
    const sample = "às 14h entre · quinta, 14h e também 9h";
    const stripped = sample.replace(APPOINTMENT_TIME_REGEX, " ");
    expect(/\d{1,2}h/.test(stripped)).toBe(false);
  });
});

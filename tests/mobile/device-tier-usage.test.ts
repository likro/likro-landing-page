import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Phase 7 — Wave 0. Invariante de arquitetura de animação adaptativa.
 *
 * CONTRATO FIRME (MOBILE-01): toda animação de seção deve passar por uma
 * primitiva de `@/components/motion` ou pelo hook `useDeviceTier` — que
 * encapsulam o tier de device. Logo: ZERO ocorrências de `whileInView`
 * literal em qualquer `.tsx` de `src/sections/`.
 *
 * O veredito é BINÁRIO e determinístico (0 ou >0) — não depende de "estado
 * real" ambíguo. GREEN se a arquitetura já está limpa (verificação — o
 * RESEARCH indica que sim). RED determinístico apontando o(s) arquivo(s)
 * violador(es) se alguma seção usar `whileInView` direto.
 */

const SECTIONS_DIR = path.resolve(__dirname, "../../src/sections");

function walkTsx(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkTsx(full));
    else if (path.extname(entry.name) === ".tsx") out.push(full);
  }
  return out;
}

describe("device-tier — invariante de animação adaptativa (MOBILE-01)", () => {
  it("zero ocorrências de whileInView em src/sections/", () => {
    const files = walkTsx(SECTIONS_DIR);
    const offenders: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const matches = content.match(/whileInView/g);
      if (matches) {
        offenders.push(
          `${path.relative(SECTIONS_DIR, file)}: ${matches.length}× whileInView`,
        );
      }
    }
    expect(
      offenders,
      `MOBILE-01 violation: seções não podem usar whileInView direto — ` +
        `use uma primitiva de @/components/motion ou useDeviceTier.\n` +
        `Violadores:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });
});

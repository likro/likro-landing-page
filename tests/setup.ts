import "@testing-library/jest-dom";
import { vi } from "vitest";

// `server-only` throws ao ser importado fora de Server Component. Em testes
// (jsdom), aliasar para um módulo no-op permite testar a lógica de rotas/libs
// que carregam o guard. Pattern padrão Next.js + vitest.
vi.mock("server-only", () => ({}));

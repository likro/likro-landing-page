/**
 * SkipLink — link "Pular para o conteúdo" (A11Y-05, WCAG 2.4.1).
 *
 * Server Component puro (sem "use client"). Renderizado como PRIMEIRO
 * elemento focável do <body> para que o primeiro Tab da página caia nele.
 *
 * Estado normal: sr-only (visualmente oculto, lido por leitores de tela).
 * Ao receber foco: focus:not-sr-only revela o link como um pill roxo no
 * canto superior esquerdo. O alvo #main-content é o <main> em page.tsx.
 *
 * z-[100] só é ativo em :focus — não obstrui conteúdo no estado normal.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent-primary focus:px-4 focus:py-2 focus:text-white"
    >
      Pular para o conteúdo principal
    </a>
  );
}

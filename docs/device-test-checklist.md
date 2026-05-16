# Real-device test — WhatsApp deep link

> Cumpre HERO-04 / CTA-04 / CTA-07. Manual; não automatizável (Playwright não simula iOS Universal Link / Android Intent).

## Pré-requisitos

- Vercel preview URL com hero deployado (`.vercel.app`)
- `NEXT_PUBLIC_WA_NUMBER=5511922324329` configurado em Vercel (Production + Preview + Development)
- iPhone real (iOS 15+) com WhatsApp instalado e número logado
- Android real (Android 10+) com WhatsApp instalado e número logado
- Instagram instalado em ambos (pra testar IAB — In-App Browser — que é o tráfego principal vindo de Meta Ads)
- Acesso ao DevTools/console do navegador (Safari iOS via cabo + Mac OU Android Chrome remote debugging) — opcional mas útil pra capturar erros JS

## Checklist iPhone

### iOS Safari (direto)

1. Abrir Safari → digitar Vercel preview URL
2. Confirmar página renderiza (hero visível, sem erros visuais)
3. Tap no CTA primário "Falar no WhatsApp" do hero
4. Esperado: WhatsApp app foreground (não Safari, não wa.me página intermediária)
5. Esperado: chat com número Likro (`+55 11 92232-4329`) aberto, mensagem pré-preenchida visível na text box
6. Esperado: mensagem é `WHATSAPP_MESSAGES.hero` literal (verificar contra `src/content/whatsapp.ts`)
7. Registrar: ✓ ou ✗ + descrição literal do comportamento

### iOS — Instagram In-App Browser

1. Abrir Instagram app
2. Postar (story, feed, ou DM) com a Vercel preview URL como link clicável (próprio usuário pode mandar pra si mesmo via DM)
3. Tap no link no Instagram → abre IAB do Instagram (NÃO Safari)
4. Confirmar página renderiza no IAB
5. Tap no CTA primário "Falar no WhatsApp"
6. Esperado: WhatsApp app foreground OU página intermediária `wa.me/5511922324329` com botão "Continue to chat"
7. Se intermediária: tap "Continue" → WhatsApp app deve foreground
8. Registrar: ✓ ou ✗ + se houve intermediária (UX subóptima conhecida do IAB iOS, não é falha do site)

### iOS — CTA secundário do Header

9. Repetir passos Safari direto + IAB Instagram pro CTA do Header
10. Esperado: mesma URL `wa.me/5511922324329` MAS mensagem é `WHATSAPP_MESSAGES.header` (texto diferente do hero — verificar literal)
11. Registrar

## Checklist Android

### Chrome (direto)

1. Mesmo fluxo do Safari direto, mas com Chrome
2. Esperado: Android Intent System resolve `wa.me/5511922324329` pro app WhatsApp
3. Esperado: mensagem `WHATSAPP_MESSAGES.hero` na text box
4. Registrar

### Android — Instagram IAB

5. Mesmo fluxo do iOS Instagram IAB
6. Esperado: geralmente Universal Link funciona; pode haver "Open in WhatsApp?" prompt do sistema Android
7. Registrar

### Android — CTA secundário do Header

8. Repetir Chrome direto + Instagram IAB pro CTA do Header
9. Esperado: mensagem `WHATSAPP_MESSAGES.header` na text box (diferente do hero)
10. Registrar

## Critérios de pass

- **Pass obrigatório:** Safari iOS direto + Chrome Android direto abrem WhatsApp app em ambos os CTAs (hero + header), com mensagem correta pré-preenchida
- **Pass desejável:** Instagram IAB iOS + Instagram IAB Android abrem WhatsApp app diretamente
- **Aceitável:** Instagram IAB iOS mostra intermediária `wa.me` page (UX do IAB, não falha do site) — desde que "Continue to chat" funcione e leve pro app

## Edge cases a observar

- **WhatsApp não instalado** (raro no Brasil): `wa.me/...` mostra página web com botão de download — comportamento aceitável, não é falha do site
- **Número errado na text box**: significa que `NEXT_PUBLIC_WA_NUMBER` não foi propagado pro build da Vercel — verificar env vars
- **Mensagem trocada hero ↔ header**: significa que `location` prop está errado no componente — bug no código
- **Sem mensagem pré-preenchida**: significa que `WHATSAPP_MESSAGES[location]` está vazio ou que o `?text=...` não foi encodado — verificar `buildWhatsAppUrl`

## Registro

Resultados literais (incluindo screenshots se possível) vão em `.planning/phases/03-hero-benchmarked-isolado/03-VERIFICATION.md` §"Real-device test", usando a tabela de 8 cenários (2 devices × 2 browsers × 2 CTAs).

"use client";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { PropsWithChildren } from "react";
import { env } from "@/lib/env";

/**
 * RESEARCH §Pattern 4 — TRACK-03.
 * Fan-out de scripts vendor:
 *  - GA4 via @next/third-parties (handles route changes corretamente)
 *  - Meta Pixel via next/script strategy="afterInteractive"
 *  - Microsoft Clarity via next/script strategy="afterInteractive"
 *
 * Pitfall E (orchestrator directive #6): Clarity script id MUST be
 * "ms-clarity", NÃO "clarity" — caso contrário conflita com window.clarity
 * function que o próprio script define, causando "Cannot redefine property".
 *
 * Graceful degradation: se env var ausente, script NÃO é montado.
 * track() em lib/analytics.ts já é defensive (optional chaining em window.fbq/gtag/clarity).
 */
export function AnalyticsProvider({ children }: PropsWithChildren) {
  return (
    <>
      {children}

      {/* GA4 — handles route changes corretamente via @next/third-parties */}
      {env.NEXT_PUBLIC_GA4_ID && <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA4_ID} />}

      {/* Meta Pixel */}
      {env.NEXT_PUBLIC_META_PIXEL_ID && (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${env.NEXT_PUBLIC_META_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* Microsoft Clarity — id "ms-clarity" (NÃO "clarity" — Pitfall E) */}
      {env.NEXT_PUBLIC_CLARITY_ID && (
        <Script
          id="ms-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${env.NEXT_PUBLIC_CLARITY_ID}");
            `,
          }}
        />
      )}
    </>
  );
}

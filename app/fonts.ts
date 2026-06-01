import { Inter, EB_Garamond } from "next/font/google";

/**
 * Fonts are loaded here and bound to the CSS variables that `config/site.ts`
 * (`brand.fonts`) and `app/globals.css` reference. next/font requires literal,
 * statically-analyzable calls, so the font *choice* lives in code — but the
 * binding to brand tokens keeps usage in components generic (`font-sans`,
 * `font-serif`). Both faces include the Greek subset for the el locale.
 */

export const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin", "greek"],
  display: "swap",
});

export const fontSerif = EB_Garamond({
  variable: "--font-serif",
  subsets: ["latin", "greek"],
  display: "swap",
});

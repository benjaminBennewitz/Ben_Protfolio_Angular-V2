/* src/app/core/services/theme-contrast.service.ts */

/**
 * @file Dynamische Kontrastberechnung für semantische Portfolio-Farbflächen.
 * @description Berechnet WCAG-konforme Vordergrundfarben aus den aktuell aktiven Theme- und Accessibility-Tokens.
 */

import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

/** RGB-Farbe mit Kanälen im Bereich von 0 bis 255. */
interface RgbColor {
  readonly red: number;
  readonly green: number;
  readonly blue: number;
}

/** Kandidat für eine dynamisch gewählte Vordergrundfarbe. */
interface ContrastCandidate {
  readonly token: string;
  readonly color: RgbColor;
}

/** Konfiguration einer Hintergrundfläche und ihres berechneten Vordergrund-Tokens. */
interface ContrastTokenConfiguration {
  readonly backgroundToken: string;
  readonly outputToken: string;
  readonly foregroundTokens: readonly string[];
}

/** WCAG-AA-Mindestkontrast für normalen Text. */
const MINIMUM_TEXT_CONTRAST = 4.5;

/** Universelle Hell-/Dunkel-Fallbacks für farbige Flächen. */
const UNIVERSAL_FOREGROUND_TOKENS = [
  '--bp-color-contrast-dark',
  '--bp-color-contrast-light',
] as const;

/** Bevorzugt den regulären Textton und fällt anschließend auf Schwarz/Weiß zurück. */
const DEFAULT_FOREGROUND_TOKENS = [
  '--bp-color-text',
  ...UNIVERSAL_FOREGROUND_TOKENS,
] as const;

/** Flächen, deren Vordergrund nach jedem Theme-/Accessibility-Wechsel neu berechnet wird. */
const CONTRAST_CONFIGURATIONS: readonly ContrastTokenConfiguration[] = [
  {
    backgroundToken: '--bp-color-accent',
    outputToken: '--bp-color-on-accent',
    foregroundTokens: DEFAULT_FOREGROUND_TOKENS,
  },
  {
    backgroundToken: '--bp-color-accent-2',
    outputToken: '--bp-color-on-accent-2',
    foregroundTokens: DEFAULT_FOREGROUND_TOKENS,
  },
  {
    backgroundToken: '--bp-color-accent-3',
    outputToken: '--bp-color-on-accent-3',
    foregroundTokens: DEFAULT_FOREGROUND_TOKENS,
  },
  {
    backgroundToken: '--bp-color-warning',
    outputToken: '--bp-color-on-warning',
    foregroundTokens: DEFAULT_FOREGROUND_TOKENS,
  },
  {
    backgroundToken: '--bp-color-danger',
    outputToken: '--bp-color-on-danger',
    foregroundTokens: DEFAULT_FOREGROUND_TOKENS,
  },
  {
    backgroundToken: '--bp-color-info',
    outputToken: '--bp-color-on-info',
    foregroundTokens: DEFAULT_FOREGROUND_TOKENS,
  },
  {
    backgroundToken: '--bp-color-surface-strong',
    outputToken: '--bp-color-on-surface-strong',
    foregroundTokens: DEFAULT_FOREGROUND_TOKENS,
  },
  {
    backgroundToken: '--bp-color-control-hover',
    outputToken: '--bp-color-on-control-hover',
    foregroundTokens: DEFAULT_FOREGROUND_TOKENS,
  },
];

/** Verwaltet dynamische Vordergrund-Tokens für wechselnde Farbflächen. */
@Injectable({ providedIn: 'root' })
export class ThemeContrastService {
  /** Dokumentreferenz zum Auflösen der tatsächlich berechneten CSS-Farben. */
  private readonly document = inject(DOCUMENT);

  /**
   * Berechnet alle semantischen `on-*`-Tokens anhand der aktuell aktiven CSS-Variablen neu.
   * Die erste Farbe mit mindestens 4.5:1 wird verwendet, andernfalls der stärkste Kandidat.
   */
  refresh(): void {
    const root = this.document.documentElement;
    const host = this.document.body ?? root;
    const probe = this.document.createElement('span');

    probe.setAttribute('aria-hidden', 'true');
    probe.style.position = 'fixed';
    probe.style.inset = 'auto';
    probe.style.width = '0';
    probe.style.height = '0';
    probe.style.overflow = 'hidden';
    probe.style.pointerEvents = 'none';
    probe.style.visibility = 'hidden';
    host.append(probe);

    const colorCache = new Map<string, RgbColor | null>();

    for (const configuration of CONTRAST_CONFIGURATIONS) {
      const background = this.resolveTokenColor(probe, configuration.backgroundToken, 'background');
      const fallbackToken = configuration.foregroundTokens[0];

      if (!background) {
        root.style.setProperty(configuration.outputToken, `var(${fallbackToken})`);
        continue;
      }

      const candidates = configuration.foregroundTokens.flatMap((token) => {
        let color = colorCache.get(token);

        if (color === undefined) {
          color = this.resolveTokenColor(probe, token, 'color');
          colorCache.set(token, color);
        }

        return color ? [{ token, color }] : [];
      });

      const selectedToken = this.selectContrastCandidate(background, candidates) ?? fallbackToken;
      root.style.setProperty(configuration.outputToken, `var(${selectedToken})`);
    }

    probe.remove();
  }

  /** Löst eine CSS-Variable über den Browser in einen konkreten RGB-Farbwert auf. */
  private resolveTokenColor(
    probe: HTMLElement,
    token: string,
    property: 'background' | 'color',
  ): RgbColor | null {
    if (property === 'background') {
      probe.style.backgroundColor = '';
      probe.style.backgroundColor = `var(${token})`;
      return this.parseCssColor(getComputedStyle(probe).backgroundColor);
    }

    probe.style.color = '';
    probe.style.color = `var(${token})`;
    return this.parseCssColor(getComputedStyle(probe).color);
  }

  /** Wählt den ersten WCAG-AA-konformen oder andernfalls den kontraststärksten Kandidaten. */
  private selectContrastCandidate(
    background: RgbColor,
    candidates: readonly ContrastCandidate[],
  ): string | null {
    let strongestToken: string | null = null;
    let strongestRatio = 0;

    for (const candidate of candidates) {
      const ratio = this.calculateContrastRatio(background, candidate.color);

      if (ratio > strongestRatio) {
        strongestRatio = ratio;
        strongestToken = candidate.token;
      }

      if (ratio >= MINIMUM_TEXT_CONTRAST) {
        return candidate.token;
      }
    }

    return strongestToken;
  }

  /** Berechnet das WCAG-Kontrastverhältnis zweier RGB-Farben. */
  private calculateContrastRatio(first: RgbColor, second: RgbColor): number {
    const firstLuminance = this.calculateRelativeLuminance(first);
    const secondLuminance = this.calculateRelativeLuminance(second);
    const lighter = Math.max(firstLuminance, secondLuminance);
    const darker = Math.min(firstLuminance, secondLuminance);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /** Berechnet die relative Leuchtdichte nach WCAG 2.x. */
  private calculateRelativeLuminance(color: RgbColor): number {
    const convert = (channel: number): number => {
      const normalized = channel / 255;

      return normalized <= 0.03928
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    };

    return (
      0.2126 * convert(color.red)
      + 0.7152 * convert(color.green)
      + 0.0722 * convert(color.blue)
    );
  }

  /** Parst Hex-, rgb-/rgba- und moderne color(srgb)-Farbangaben aus getComputedStyle. */
  private parseCssColor(value: string): RgbColor | null {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === 'black') {
      return { red: 0, green: 0, blue: 0 };
    }

    if (normalizedValue === 'white') {
      return { red: 255, green: 255, blue: 255 };
    }

    const shortHexMatch = normalizedValue.match(/^#([\da-f])([\da-f])([\da-f])(?:[\da-f])?$/i);

    if (shortHexMatch) {
      return {
        red: Number.parseInt(`${shortHexMatch[1]}${shortHexMatch[1]}`, 16),
        green: Number.parseInt(`${shortHexMatch[2]}${shortHexMatch[2]}`, 16),
        blue: Number.parseInt(`${shortHexMatch[3]}${shortHexMatch[3]}`, 16),
      };
    }

    const longHexMatch = normalizedValue.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})(?:[\da-f]{2})?$/i);

    if (longHexMatch) {
      return {
        red: Number.parseInt(longHexMatch[1], 16),
        green: Number.parseInt(longHexMatch[2], 16),
        blue: Number.parseInt(longHexMatch[3], 16),
      };
    }

    const rgbMatch = normalizedValue.match(
      /^rgba?\(\s*([+-]?[\d.]+%?)(?:\s*,\s*|\s+)([+-]?[\d.]+%?)(?:\s*,\s*|\s+)([+-]?[\d.]+%?)(?:\s*(?:,|\/)\s*[\d.]+%?)?\s*\)$/i,
    );

    if (rgbMatch) {
      return {
        red: this.parseRgbChannel(rgbMatch[1]),
        green: this.parseRgbChannel(rgbMatch[2]),
        blue: this.parseRgbChannel(rgbMatch[3]),
      };
    }

    const srgbMatch = normalizedValue.match(
      /^color\(\s*srgb\s+([+-]?[\d.]+%?)\s+([+-]?[\d.]+%?)\s+([+-]?[\d.]+%?)(?:\s*\/\s*[\d.]+%?)?\s*\)$/i,
    );

    if (srgbMatch) {
      return {
        red: this.parseSrgbChannel(srgbMatch[1]),
        green: this.parseSrgbChannel(srgbMatch[2]),
        blue: this.parseSrgbChannel(srgbMatch[3]),
      };
    }

    return null;
  }

  /** Wandelt einen klassischen RGB-Kanal oder Prozentwert in 0 bis 255 um. */
  private parseRgbChannel(value: string): number {
    if (value.endsWith('%')) {
      return this.clampChannel((Number.parseFloat(value) / 100) * 255);
    }

    return this.clampChannel(Number.parseFloat(value));
  }

  /** Wandelt einen sRGB-Kanal oder Prozentwert in 0 bis 255 um. */
  private parseSrgbChannel(value: string): number {
    if (value.endsWith('%')) {
      return this.clampChannel((Number.parseFloat(value) / 100) * 255);
    }

    return this.clampChannel(Number.parseFloat(value) * 255);
  }

  /** Begrenzt einen Farbkanal auf den gültigen RGB-Bereich. */
  private clampChannel(channel: number): number {
    return Math.min(255, Math.max(0, channel));
  }
}

import type { Metadata } from 'next';
import { M_PLUS_Rounded_1c } from 'next/font/google';
import './globals.css';

// タイトル用の丸ゴシック（親しみやすさのため見出しのみに使用）
const roundedFont = M_PLUS_Rounded_1c({
  weight: ['700', '800'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  variable: '--font-rounded',
});

export const metadata: Metadata = {
  title: 'ポケモン パーティ相性診断 | 色でわかる、パーティの弱点と耐性バランス',
  description:
    'ポケモンのパーティを入力するだけで、タイプごとの弱点と耐性を色で診断。表が青いほど守りの強いパーティです。',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={roundedFont.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (typeof window === 'undefined' || typeof document === 'undefined') return;
                  if (!document.documentElement) return;
                  
                  const stored = localStorage.getItem('theme');
                  const isDark = stored === 'dark' || stored === 'light'
                    ? stored === 'dark'
                    : typeof window.matchMedia !== 'undefined' &&
                      window.matchMedia('(prefers-color-scheme: dark)').matches;
                  document.documentElement.classList.toggle('dark', isDark);
                } catch (e) {
                  try {
                    if (typeof document !== 'undefined' && document.documentElement) {
                      document.documentElement.classList.remove('dark');
                    }
                  } catch (e2) {
                  }
                }
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}


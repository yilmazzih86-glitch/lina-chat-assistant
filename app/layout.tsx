// app/layout.tsx
import "./globals.scss";

export const metadata = {
  title: "Lina Asistan",
  description: "SpektrumCreative - Lina Web Chat",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}

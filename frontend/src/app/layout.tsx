import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Система паспортного учета",
  description: "Единая система регистрации и учета граждан Российской Федерации"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = window.localStorage.getItem("passport-theme");
                  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  var shouldUseDark = storedTheme ? storedTheme === "dark" : prefersDark;
                  document.documentElement.classList.toggle("dark", shouldUseDark);
                } catch (error) {}
              })();
            `
          }}
        />
        {children}
      </body>
    </html>
  );
}

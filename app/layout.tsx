import type { Metadata } from "next"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"
import "./globals.css"

export const metadata: Metadata = {
  title: "VaultString",
  description: "Cross border payment and wallet system",
  icons: {
    icon: "/icons/favicon.svg",
    shortcut: "/icons/favicon.svg",
    apple: "/icons/favicon.svg",
  },
}

import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "sonner"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {/* Auth pages are handled by (auth)/layout.tsx, dashboard pages get sidebar/header */}
            {children}
            <Toaster />
            <Sonner position="top-right" expand={true} richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

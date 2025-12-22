import type { Metadata } from "next"
import { Inter, Manrope } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const manrope = Manrope({ 
  subsets: ["latin"],
  variable: "--font-manrope", 
  display: "swap",
})

export const metadata: Metadata = {
  title: "VaultString",
  description: "Cross border payment and wallet system",
  icons: {
    icon: "/icons/favicon.svg",
    shortcut: "/icons/favicon.svg",
    apple: "/icons/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Check if we're on the login page or other auth pages
  const isAuthPage = false // You can implement logic to check current route

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {isAuthPage ? (
            // Render auth pages without sidebar/header
            children
          ) : (
            // Render dashboard pages with sidebar/header
            <div className="flex h-screen">
              <Sidebar />
              <div className="flex flex-1 flex-col pl-64">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto bg-background p-6">{children}</main>
              </div>
            </div>
          )}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
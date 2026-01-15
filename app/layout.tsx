import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import './globals.css'

export const metadata: Metadata = {
  title: 'SubMgr - 订阅管理',
  description: '管理你的订阅服务，支持拼车分摊、账期追踪',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <div className="flex h-screen">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between border-b px-4 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <MobileNav />
              <h1 className="text-lg font-bold">SubMgr</h1>
              <div className="w-10" /> {/* Spacer for centering */}
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  )
}

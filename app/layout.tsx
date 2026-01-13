import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'
import { Sidebar } from '@/components/layout/sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'SubMgr - 订阅管理',
  description: '管理你的订阅服务',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}

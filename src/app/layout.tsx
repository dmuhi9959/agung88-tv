import './globals.css'
export const metadata = { title: 'BIRU TV', description: 'Live TV streaming untuk STB Android TV' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="id"><body>{children}</body></html>
}

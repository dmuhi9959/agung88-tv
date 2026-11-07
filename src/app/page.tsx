'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Tv, Play, Loader2, AlertCircle, RefreshCw, Search, X, Star } from 'lucide-react'
import { toast } from 'sonner'

interface Channel { id: string; name: string; streamUrl: string; logoUrl: string; category: string; featured: boolean }

export default function Home() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [playerOpen, setPlayerOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const fetchChannels = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      if (category !== 'all') params.set('category', category)
      const res = await fetch(`/api/channels?${params.toString()}`)
      const json = await res.json()
      if (json.success) setChannels(json.data)
    } catch { toast.error('Gagal terhubung ke server') }
    finally { setLoading(false) }
  }, [search, category])

  useEffect(() => { fetchChannels() }, [fetchChannels])

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#0a1628' }}>
      <header className="border-b border-blue-900/30 bg-black/80 shrink-0 z-20">
        <div className="flex h-14 items-center gap-3 px-5">
          <div className="size-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Tv className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-sm text-white">BIRU TV</span>
            <span className="text-[10px] text-blue-400">Live Streaming</span>
          </div>
          <div className="flex-1"></div>
          <button onClick={() => fetchChannels()} disabled={loading} className="size-9 rounded-lg hover:bg-white/10 text-white flex items-center justify-center">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto z-10">
        <TVView channels={channels} loading={loading} search={search} setSearch={setSearch} category={category} setCategory={setCategory} onOpen={(c) => { setSelectedChannel(c); setPlayerOpen(true) }} />
      </main>

      <PlayerModal channel={selectedChannel} open={playerOpen} onClose={() => setPlayerOpen(false)} />
    </div>
  )
}

function TVView({ channels, loading, search, setSearch, category, setCategory, onOpen }: any) {
  const categories = ['all', ...Array.from(new Set(channels.map((c: Channel) => c.category)))].sort()
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (channels.length > 0 && !loading) {
      const t = setTimeout(() => { const first = document.querySelector('[data-channel-card]') as HTMLElement; if (first) first.focus() }, 200)
      return () => clearTimeout(t)
    }
  }, [channels, loading])

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(channels[idx]); return }
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Up','Down','Left','Right'].includes(e.key)) {
      e.preventDefault()
      const grid = gridRef.current; if (!grid) return
      const cards = Array.from(grid.querySelectorAll('[data-channel-card]')) as HTMLElement[]
      let cols = 6
      try { const t = window.getComputedStyle(grid).getPropertyValue('grid-template-columns'); cols = t.split(' ').filter(s => s.trim()).length || 6 } catch {}
      let next = idx
      if (e.key === 'ArrowRight' || e.key === 'Right') next = idx + 1
      else if (e.key === 'ArrowLeft' || e.key === 'Left') next = idx - 1
      else if (e.key === 'ArrowDown' || e.key === 'Down') next = idx + cols
      else if (e.key === 'ArrowUp' || e.key === 'Up') next = idx - cols
      if (next < 0) next = 0; if (next >= cards.length) next = cards.length - 1
      if (next !== idx) cards[next]?.focus()
    }
  }

  return (
    <div className="px-2 py-2 max-w-7xl mx-auto">
      <div className="mb-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input type="text" placeholder="Cari channel..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-9 pl-9 pr-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:border-blue-500 outline-none" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-9 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500 outline-none">
          {categories.map((c: string) => <option key={c} value={c} className="bg-black">{c === 'all' ? 'Semua' : c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-video bg-white/5 rounded-lg animate-pulse" />)}
        </div>
      ) : channels.length === 0 ? (
        <div className="text-center py-20"><Tv className="h-12 w-12 mx-auto text-white/20 mb-3" /><p className="text-sm text-white/40">Belum ada channel tersedia.</p></div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {channels.map((channel: Channel, idx: number) => (
            <div key={channel.id} data-channel-card tabIndex={0} role="button" onClick={() => onOpen(channel)} onKeyDown={(e) => handleKeyDown(e, idx)} className="channel-card focus-ring aspect-video relative rounded-lg overflow-hidden cursor-pointer border border-white/10 bg-white/5 group" aria-label={`Channel ${channel.name}`}>
              {channel.logoUrl ? <img src={channel.logoUrl} alt={channel.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Tv className="h-8 w-8 text-white/30" /></div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-1.5"><p className="text-[10px] sm:text-xs font-semibold text-white truncate">{channel.name}</p></div>
              {channel.featured && <Star className="absolute top-1 right-1 h-3 w-3 text-amber-400 fill-amber-400" />}
              <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Play className="h-8 w-8 text-white" /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PlayerModal({ channel, open, onClose }: any) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !channel) return
    setLoading(true); setError('')
    const video = videoRef.current; if (!video) return
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }
    const isM3U8 = channel.streamUrl.includes('.m3u8')
    if (isM3U8 && video.canPlayType('application/vnd.apple.mpegurl')) { video.src = channel.streamUrl; video.play().catch(() => {}) }
    else if (isM3U8) {
      import('hls.js').then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true, lowLatencyMode: true })
          hlsRef.current = hls
          hls.loadSource(channel.streamUrl); hls.attachMedia(video)
          hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); setLoading(false) })
          hls.on(Hls.Events.ERROR, (_e: any, data: any) => { if (data.fatal) { setError('Gagal memuat stream. Channel mungkin offline.'); setLoading(false) } })
        } else { setError('Browser tidak support HLS'); setLoading(false) }
      })
    } else { video.src = channel.streamUrl; video.play().catch(() => {}); setLoading(false) }
    return () => { if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null } }
  }, [open, channel])

  if (!open || !channel) return null

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-10 p-3 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2">
          {channel.logoUrl && <img src={channel.logoUrl} alt={channel.name} className="size-8 rounded object-cover" />}
          <div><h2 className="text-sm font-bold text-white">{channel.name}</h2><p className="text-[10px] text-white/60">{channel.category}</p></div>
        </div>
        <button onClick={onClose} className="size-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"><X className="h-5 w-5" /></button>
      </div>
      <div className="video-container flex-1 flex items-center justify-center">
        {loading && <div className="spinner" />}
        {error && <div className="text-center px-6"><AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-3" /><p className="text-white font-semibold mb-1">{error}</p><p className="text-white/60 text-sm">Coba channel lain</p></div>}
        <video ref={videoRef} className="w-full h-full" controls autoPlay playsInline />
      </div>
    </div>
  )
}

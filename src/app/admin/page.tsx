'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2, Plus, RefreshCw, Tv, Upload, Link, Trash2, Star } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminPage() {
  const [channels, setChannels] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [m3uUrl, setM3uUrl] = useState('')
  const [m3uFile, setM3uFile] = useState<File | null>(null)
  const [m3uContent, setM3uContent] = useState('')
  const [tab, setTab] = useState<'file' | 'url' | 'manual'>('file')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [manualName, setManualName] = useState(''); const [manualStreamUrl, setManualStreamUrl] = useState(''); const [manualLogoUrl, setManualLogoUrl] = useState(''); const [manualCategory, setManualCategory] = useState('general')

  const fetchChannels = useCallback(async () => { setLoading(true); try { const res = await fetch('/api/channels'); const json = await res.json(); if (json.success) setChannels(json.data) } catch {} setLoading(false) }, [])
  useEffect(() => { fetchChannels() }, [fetchChannels])

  const handleImport = async (data: any) => {
    setImporting(true)
    try { const res = await fetch('/api/m3u/fetch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const json = await res.json(); if (json.success) { toast.success(json.message); fetchChannels(); setM3uUrl(''); setM3uFile(null); setM3uContent(''); if (fileInputRef.current) fileInputRef.current.value = '' } else toast.error(json.error || 'Gagal') } catch { toast.error('Gagal terhubung') } finally { setImporting(false) }
  }

  const handleFile = async () => {
    if (!m3uFile && !m3uContent.trim()) { toast.error('Pilih file atau paste konten'); return }
    let content = m3uContent; if (m3uFile) content = await m3uFile.text()
    handleImport({ content })
  }

  const handleManual = async () => {
    if (!manualName.trim() || !manualStreamUrl.trim()) { toast.error('Nama dan URL wajib'); return }
    setImporting(true)
    try { const res = await fetch('/api/channels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: manualName, streamUrl: manualStreamUrl, logoUrl: manualLogoUrl, category: manualCategory }) }); const json = await res.json(); if (json.success) { toast.success('Channel ditambahkan'); fetchChannels(); setManualName(''); setManualStreamUrl(''); setManualLogoUrl('') } else toast.error(json.error) } catch { toast.error('Gagal') } finally { setImporting(false) }
  }

  const handleDelete = async (id: string) => { try { await fetch(`/api/channels/${id}`, { method: 'DELETE' }); toast.success('Dihapus'); fetchChannels() } catch {} }
  const handleDeleteAll = async () => { if (!confirm(`Hapus SEMUA ${channels.length} channel?`)) return; setImporting(true); for (const c of channels) await fetch(`/api/channels/${c.id}`, { method: 'DELETE' }); toast.success('Semua dihapus'); fetchChannels(); setImporting(false) }

  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6"><div className="size-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center"><Tv className="h-5 w-5 text-white" /></div><div><h1 className="text-lg font-bold">BIRU TV - Admin</h1><p className="text-xs text-white/60">Upload M3U & manage channel</p></div></div>
      <div className="grid grid-cols-2 gap-2 mb-4"><div className="bg-white/5 rounded-lg p-3 border border-white/10"><div className="text-[10px] text-white/60">Total Channel</div><div className="text-2xl font-bold text-blue-400">{channels.length}</div></div><div className="bg-white/5 rounded-lg p-3 border border-white/10"><div className="text-[10px] text-white/60">Featured</div><div className="text-2xl font-bold text-amber-400">{channels.filter(c => c.featured).length}</div></div></div>
      
      <div className="flex gap-1 mb-3 border-b border-white/10">
        <button onClick={() => setTab('file')} className={`px-4 py-2 text-sm border-b-2 ${tab === 'file' ? 'border-blue-500 text-blue-400' : 'border-transparent text-white/40'}`}>Upload File</button>
        <button onClick={() => setTab('url')} className={`px-4 py-2 text-sm border-b-2 ${tab === 'url' ? 'border-blue-500 text-blue-400' : 'border-transparent text-white/40'}`}>Import URL</button>
        <button onClick={() => setTab('manual')} className={`px-4 py-2 text-sm border-b-2 ${tab === 'manual' ? 'border-blue-500 text-blue-400' : 'border-transparent text-white/40'}`}>Manual</button>
      </div>

      {tab === 'file' && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4 space-y-3">
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500/50">
            {m3uFile ? <div className="text-blue-400"><Upload className="h-8 w-8 mx-auto mb-2" /><p className="font-semibold">{m3uFile.name}</p><p className="text-xs text-white/40">{(m3uFile.size / 1024).toFixed(1)} KB</p></div> : <div className="text-white/40"><Upload className="h-8 w-8 mx-auto mb-2" /><p className="text-sm">Klik untuk pilih file .m3u</p></div>}
            <input ref={fileInputRef} type="file" accept=".m3u,.m3u8,.txt" onChange={(e) => { const f = e.target.files?.[0]; if (f) setM3uFile(f) }} className="hidden" />
          </div>
          <textarea value={m3uContent} onChange={(e) => setM3uContent(e.target.value)} placeholder="Atau paste konten M3U..." rows={4} className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs font-mono text-white/80 outline-none focus:border-blue-500" />
          <button onClick={handleFile} disabled={importing || (!m3uFile && !m3uContent.trim())} className="w-full h-10 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2">{importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}Import M3U</button>
        </div>
      )}
      {tab === 'url' && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4 space-y-3">
          <input type="text" value={m3uUrl} onChange={(e) => setM3uUrl(e.target.value)} placeholder="https://example.com/playlist.m3u" className="w-full h-9 px-3 bg-black/60 border border-white/10 rounded-lg text-sm outline-none focus:border-blue-500" />
          <button onClick={() => handleImport({ m3uUrl })} disabled={importing || !m3uUrl.trim()} className="w-full h-10 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2">{importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link className="h-4 w-4" />}Import dari URL</button>
        </div>
      )}
      {tab === 'manual' && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4 space-y-2">
          <input type="text" value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="Nama Channel" className="w-full h-9 px-3 bg-black/60 border border-white/10 rounded-lg text-sm outline-none focus:border-blue-500" />
          <input type="text" value={manualStreamUrl} onChange={(e) => setManualStreamUrl(e.target.value)} placeholder="URL Stream (.m3u8)" className="w-full h-9 px-3 bg-black/60 border border-white/10 rounded-lg text-sm font-mono outline-none focus:border-blue-500" />
          <input type="text" value={manualLogoUrl} onChange={(e) => setManualLogoUrl(e.target.value)} placeholder="URL Logo (opsional)" className="w-full h-9 px-3 bg-black/60 border border-white/10 rounded-lg text-sm outline-none focus:border-blue-500" />
          <input type="text" value={manualCategory} onChange={(e) => setManualCategory(e.target.value)} placeholder="Kategori" className="w-full h-9 px-3 bg-black/60 border border-white/10 rounded-lg text-sm outline-none focus:border-blue-500" />
          <button onClick={handleManual} disabled={importing || !manualName.trim() || !manualStreamUrl.trim()} className="w-full h-10 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2"><Plus className="h-4 w-4" />Tambah Channel</button>
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-white/60 uppercase">Daftar Channel ({channels.length})</div>
        {channels.length > 0 && <button onClick={handleDeleteAll} disabled={importing} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"><Trash2 className="h-3 w-3" />Hapus Semua</button>}
      </div>
      {loading ? <div className="text-center py-10"><Loader2 className="h-6 w-6 mx-auto animate-spin text-white/40" /></div> : channels.length === 0 ? <div className="text-center py-10 bg-white/5 rounded-lg border border-dashed border-white/10"><Tv className="h-8 w-8 mx-auto text-white/20 mb-2" /><p className="text-sm text-white/40">Belum ada channel</p></div> : (
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {channels.map(c => <div key={c.id} className="bg-white/5 rounded-lg p-2 border border-white/10 flex items-center gap-2">
            {c.logoUrl ? <img src={c.logoUrl} alt={c.name} className="size-8 rounded object-cover" /> : <div className="size-8 rounded bg-white/10 flex items-center justify-center"><Tv className="h-4 w-4 text-white/40" /></div>}
            <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{c.name}</div><div className="text-[10px] text-white/40">{c.category}</div></div>
            <button onClick={() => handleDelete(c.id)} className="size-7 rounded text-red-400 hover:bg-red-500/10 flex items-center justify-center"><Trash2 className="h-4 w-4" /></button>
          </div>)}
        </div>
      )}
    </div>
  )
}

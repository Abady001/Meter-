'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { usePageStore } from '@/lib/router-store';
import { apiGet } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GlobalSearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { navigate } = usePageStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    if (open) { setQuery(''); setResults([]); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try { const data = await apiGet<any>(`/search?q=${encodeURIComponent(query)}`); setResults(data.results ?? []); } catch { setResults([]); }
      setLoading(false);
    }, 300);
  }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[selectedIdx]) {
      const r = results[selectedIdx];
      navigate(r.route as any, r.params);
      onClose();
    }
    if (e.key === 'Escape') onClose();
  }, [results, selectedIdx, navigate, onClose]);

  if (!open) return null;

  const typeColors: Record<string, string> = { customer: 'bg-blue-500/10 text-blue-600', project: 'bg-purple-500/10 text-purple-600', meter: 'bg-amber-500/10 text-amber-600', invoice: 'bg-emerald-500/10 text-emerald-600', payment: 'bg-violet-500/10 text-violet-600', ticket: 'bg-rose-500/10 text-rose-600' };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div className="relative w-full max-w-xl bg-background rounded-xl shadow-2xl border border-border/50 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 border-b border-border/30">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }} onKeyDown={handleKeyDown} placeholder="Search customers, meters, invoices..." className="border-0 shadow-none focus-visible:ring-0 text-base p-0 h-auto" />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />}
          <kbd className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded border border-border/50 bg-muted text-muted-foreground">ESC</kbd>
        </div>
        {results.length > 0 && (
          <div className="max-h-[400px] overflow-y-auto p-2">
            {results.map((r, i) => (
              <div key={`${r.type}-${r.id}`} className={cn('flex items-center gap-3 p-2.5 rounded-lg cursor-pointer text-sm transition-colors', i === selectedIdx ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50')} onClick={() => { navigate(r.route as any, r.params); onClose(); }} onMouseEnter={() => setSelectedIdx(i)}>
                <span className={cn('text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded shrink-0', typeColors[r.type] ?? 'bg-gray-500/10 text-gray-600')}>{r.type}</span>
                <div className="flex-1 min-w-0"><p className="font-medium truncate">{r.label}</p>{r.sublabel && <p className="text-xs text-muted-foreground truncate">{r.sublabel}</p>}</div>
              </div>
            ))}
          </div>
        )}
        {query.length >= 2 && !loading && results.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No results found</div>}
      </div>
    </div>
  );
}

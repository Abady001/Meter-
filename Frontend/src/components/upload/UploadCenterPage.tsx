'use client';
import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiPost, apiGet } from '@/lib/api';
import { getAuthHeaders } from '@/lib/api/auth';
import { PageHeader, formatDateTime } from '@/components/shared/PageHelpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SmartTable from '@/components/smart-table/SmartTable';
import { toast } from 'sonner';
import { Upload, Download, FileText, CheckCircle, XCircle, AlertTriangle, ListChecks } from 'lucide-react';
import { useT } from '@/lib/i18n/context';

const IMPORT_TYPES = [
  { key: 'readings', label: 'Readings', file: 'readings_template.xlsx' },
  { key: 'solar-readings', label: 'Solar Readings', file: 'readings_template_solar.xlsx' },
  { key: 'meters', label: 'Meters', file: 'meters_template.xlsx' },
  { key: 'customers', label: 'Customers', file: 'customers_template.xlsx' },
  { key: 'payments', label: 'Payments', file: 'payments_template.xlsx' },
  { key: 'settlements', label: 'Settlements', file: 'meter_settlements_template.xlsx' },
  { key: 'sim-cards', label: 'SIM Cards', file: 'Sim_Card_Template.xlsx' },
  { key: 'delete-readings', label: 'Delete Readings', file: 'delete_readings_template.xlsx' },
  { key: 'migration', label: 'Migration', file: 'migration_template.xlsx' },
];

export default function UploadCenterPage() {
  const t = useT();
  const [entityType, setEntityType] = useState('readings');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const { data: history } = useQuery({
    queryKey: ['upload-history', entityType],
    queryFn: () => apiGet<any[]>(`/upload/history/${entityType}`).catch(() => []),
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', entityType);
      const projectId = localStorage.getItem('selected-project') || '';
      formData.append('projectId', projectId);

      const data = await apiPost<any>('/upload/file', formData);
      setResult({ success: data.success ?? 0, failed: data.failed ?? 0, errors: data.errors ?? [] });
      qc.invalidateQueries({ queryKey: ['upload-history'] });

      if (data.success > 0 && data.failed === 0) {
        toast.success(`${data.success} records imported successfully`, { duration: 5000 });
      } else if (data.success > 0 && data.failed > 0) {
        toast(`${data.success} imported, ${data.failed} failed`, {
          duration: 8000,
          icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
        });
      } else if (data.failed > 0) {
        toast.error(`${data.failed} records failed — check error details`, { duration: 8000 });
      }
    } catch (e: any) {
      const msg = e?.message || e?.statusText || 'Server error';
      toast.error('Upload failed: ' + msg);
      setResult({ success: 0, failed: 0, errors: [msg] });
    }
    setUploading(false);
    setFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const currentType = IMPORT_TYPES.find(t => t.key === entityType);

  return (
    <div className="space-y-6">
      <PageHeader title={t('upload.title')} subtitle={t('upload.subtitle')} />

      {/* Result Banner */}
      {result && (
        <div className="fixed bottom-6 right-6 z-50 min-w-[320px] max-w-md animate-in slide-in-from-right">
          <Card className={`shadow-2xl border-2 ${result.failed > 0 ? 'border-red-300 dark:border-red-800' : 'border-emerald-300 dark:border-emerald-800'}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {result.failed > 0 ? (
                  <XCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-emerald-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{result.success} imported</span>
                    {result.failed > 0 && <span className="text-sm font-semibold text-red-600 dark:text-red-400">{result.failed} failed</span>}
                  </div>
                  {result.errors.length > 0 && (
                    <div className="mt-2 max-h-[200px] overflow-y-auto space-y-1">
                      {result.errors.map((err, i) => (
                        <div key={i} className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded px-2 py-1">
                          {err}
                        </div>
                      ))}
                    </div>
                  )}
                  {result.errors.length === 0 && result.success > 0 && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">All records imported successfully</p>
                  )}
                </div>
                <button onClick={() => setResult(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">&times;</button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="readings" onValueChange={setEntityType}>
        <TabsList className="mb-4 flex-wrap h-auto">
          {IMPORT_TYPES.map(t => (
            <TabsTrigger key={t.key} value={t.key} className="text-xs">{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Card */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload {currentType?.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Upload an Excel file (.xlsx) matching the {currentType?.label} template format.
                <a href="#"
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
                      const headers = await getAuthHeaders();
                      const res = await fetch(`${apiUrl}/upload/template/${entityType}`, { headers });
                      if (!res.ok) { toast.error('Download failed'); return; }
                      const blob = await res.blob();
                      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${entityType}-template.xlsx`; a.click();
                      URL.revokeObjectURL(a.href);
                    } catch { toast.error('Download failed'); }
                  }}
                  className="text-primary hover:underline ml-1">Download template</a>
              </p>
              <Input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={e => { setFile(e.target.files?.[0] ?? null); setResult(null); }} />
              {file && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleUpload} disabled={!file || uploading} className="gap-1.5">
                  {uploading ? (
                    <span className="flex items-center gap-1.5"><span className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />Uploading...</span>
                  ) : (
                    <><Upload className="h-3.5 w-3.5" />Upload</>
                  )}
                </Button>
                {result && (
                  <Button variant="outline" size="sm" onClick={() => setResult(null)}>Clear</Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* History Card */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Upload History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SmartTable data={history ?? []} columns={[
                { key: 'entityType', label: 'Type' },
                { key: 'fileName', label: 'File' },
                { key: 'success', label: 'Success', render: (v: number) => <span className="text-emerald-500 font-medium">{v}</span> },
                { key: 'failed', label: 'Failed', render: (v: number) => <span className={`font-medium ${v > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>{v}</span> },
                { key: 'totalRows', label: 'Total' },
                { key: 'createdAt', label: 'Date', render: (v: string) => formatDateTime(v) },
              ]} emptyMessage="No uploads yet" />
            </CardContent>
          </Card>
        </div>

        {/* Error Details */}
        {result && result.errors.length > 0 && (
          <Card className="mt-4 border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Error Details ({result.errors.length} rows failed)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {result.errors.map((err, i) => (
                  <div key={i} className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded px-3 py-1.5 border border-red-100 dark:border-red-900">
                    {err}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </Tabs>
    </div>
  );
}

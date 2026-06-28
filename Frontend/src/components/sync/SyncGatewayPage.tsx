'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHelpers';
import { RefreshCw, Server, Database, Activity, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const ORCHESTRATOR_URL = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || 'http://localhost:4000';

interface GatewayStatus {
  area: string;
  port: number;
  symbiot_url: string;
  billing_url: string;
  status: 'checking' | 'online' | 'offline';
  latency?: number;
  error?: string;
}

const GATEWAYS = [
  { area: 'october',     port: 4001, symbiot: '10.50.30.2/PalmHills_October',   billing: '10.50.30.2:9999' },
  { area: 'new_cairo',   port: 4002, symbiot: '10.50.30.2/PalmHills_NewCairo',  billing: '10.50.30.2:9090' },
  { area: 'sodic_ednc',  port: 4003, symbiot: '10.50.30.2/SODIC',               billing: '10.50.30.2:9191' },
  { area: 'uvenus_mall', port: 4004, symbiot: '10.50.30.4/ABRAJ_UVENUS',        billing: '10.50.30.4:9191' },
  { area: 'badya',       port: 4005, symbiot: '10.50.30.5/Badya',               billing: '10.50.30.5:9090' },
  { area: 'bo_island',   port: 4006, symbiot: '10.50.30.5/BO-Island',           billing: '10.50.30.5:9999' },
  { area: 'estates',     port: 4007, symbiot: '10.50.30.5/Estates',             billing: '10.50.30.5:9000' },
  { area: 'sodic_vye',   port: 4008, symbiot: '10.50.30.5/Sodic-VYE',           billing: '10.50.30.5:9909' },
  { area: 'chillout',    port: 4009, symbiot: '10.50.30.5/Chillout',            billing: '10.50.30.5:9990' },
];

const STATUS_NAMES = { october: 'October', new_cairo: 'New Cairo', sodic_ednc: 'Sodic EDNC', uvenus_mall: 'Uvenus Mall', badya: 'Badya', bo_island: 'Bo Island', estates: 'Estates', sodic_vye: 'Sodic VYE', chillout: 'Chillout' };

export default function SyncGatewayPage() {
  const [gateways, setGateways] = useState<GatewayStatus[]>(
    GATEWAYS.map(g => ({ ...g, status: 'checking' }))
  );
  const [orchestratorOk, setOrchestratorOk] = useState<boolean | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const checkAll = async () => {
    setRefreshing(true);
    
    // Check orchestrator
    try {
      const r = await fetch(ORCHESTRATOR_URL + '/health', { signal: AbortSignal.timeout(5000) });
      setOrchestratorOk(r.ok);
    } catch { setOrchestratorOk(false); }

    // Check each gateway
    const results = await Promise.all(
      GATEWAYS.map(async (gw) => {
        const start = Date.now();
        try {
          const r = await fetch(`http://localhost:${gw.port}/health`, { signal: AbortSignal.timeout(5000) });
          const data = await r.json();
          return { ...gw, status: r.ok ? 'online' as const : 'offline' as const, latency: Date.now() - start, error: r.ok ? undefined : data?.error };
        } catch (e: any) {
          return { ...gw, status: 'offline' as const, error: e.message };
        }
      })
    );
    setGateways(results);
    setRefreshing(false);
  };

  useEffect(() => { checkAll(); }, []);

  const online = gateways.filter(g => g.status === 'online').length;
  const total = gateways.length;

  return (
    <div>
      <PageHeader title="Sync Gateway Control" description="Monitor and control all Symbiot sync gateways" />

      <div className="flex gap-4 mb-6 flex-wrap">
        <Card className="flex-1 min-w-[200px]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Server className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{orchestratorOk === true ? 'Online' : orchestratorOk === false ? 'Offline' : '...'}</p>
                <p className="text-xs text-muted-foreground">Orchestrator (port 4000)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[200px]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">{online}/{total}</p>
                <p className="text-xs text-muted-foreground">Gateways Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex items-end">
          <Button onClick={checkAll} disabled={refreshing} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Checking...' : 'Refresh All'}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gateways.map(gw => (
          <Card key={gw.area} className={`border-l-4 ${gw.status === 'online' ? 'border-l-emerald-500' : gw.status === 'offline' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm capitalize">{STATUS_NAMES[gw.area as keyof typeof STATUS_NAMES]}</CardTitle>
              {gw.status === 'online' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> :
               gw.status === 'offline' ? <XCircle className="h-5 w-5 text-red-500" /> :
               <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />}
            </CardHeader>
            <CardContent className="text-xs space-y-1.5">
              <div className="flex justify-between"><span className="text-muted-foreground">Gateway Port</span><span className="font-mono">{gw.port}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Symbiot</span><span className="font-mono text-[10px]">{gw.symbiot_url}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Billing</span><span className="font-mono text-[10px]">{gw.billing_url}</span></div>
              {gw.latency && <div className="flex justify-between"><span className="text-muted-foreground">Latency</span><span>{gw.latency}ms</span></div>}
              {gw.error && <div className="text-red-500 mt-1">{gw.error}</div>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

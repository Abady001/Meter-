'use client';

import { useState, useMemo, useEffect } from 'react';
import { usePageStore } from '@/lib/router-store';
import { PageHeader, StatCard } from '@/components/shared/PageHelpers';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, ChevronDown, ChevronRight, Building2, Layers, Home, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n/context';
import { useProjectsList } from '@/hooks/use-projects';
import { useLocationsList } from '@/hooks/use-locations';
import { useCreateLocation, type CreateLocationPayload } from '@/hooks/use-create-location';
import { useUpdateLocation, type UpdateLocationPayload } from '@/hooks/use-update-location';
import { useDeleteLocation } from '@/hooks/use-delete-location';
import type { Location } from '@/lib/types';

type DialogMode = 'create' | 'edit' | null;

const INITIAL_FORM: CreateLocationPayload = {
  nodeType: 'unit',
  code: '',
  name: '',
};

export default function LocationsPage() {
  const t = useT();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [expandedBuilding, setExpandedBuilding] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [form, setForm] = useState<CreateLocationPayload>(INITIAL_FORM);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);

  const { data: apiProjects, isLoading, isError, error } = useProjectsList();

  useEffect(() => {
    if (!selectedProject) {
      const stored = localStorage.getItem('selected-project');
      if (stored) setSelectedProject(stored);
    }
  }, []);
  const projects = apiProjects ?? [];
  const { data: apiLocations, isLoading: locLoading } = useLocationsList(selectedProject);
  const createMutation = useCreateLocation(selectedProject);
  const updateMutation = useUpdateLocation(selectedProject);
  const deleteMutation = useDeleteLocation(selectedProject);

  const buildings = useMemo(() => {
    if (apiLocations) {
      return apiLocations
        .filter((l) => l.nodeType === 'building')
        .map((l) => ({ id: l.id, name: l.name, floors: 0, units: 0, location: l }));
    }
    return [];
  }, [apiLocations]);

  const units = useMemo(() => {
    if (apiLocations) {
      return apiLocations
        .filter((l) => l.nodeType === 'unit')
        .map((l) => ({
          id: l.id,
          floorNumber: parseInt(l.code.replace(/\D/g, ''), 10) || 1,
          unitNumber: l.code,
          unitType: 'unit',
          status: l.status
        }));
    }
    return [];
  }, [apiLocations]);

  const openCreateDialog = (nodeType: 'building' | 'unit') => {
    setForm({ nodeType, code: '', name: '' });
    setEditingLocation(null);
    setDialogMode('create');
  };

  const openEditDialog = (location: Location) => {
    setForm({ nodeType: location.nodeType as 'building' | 'unit', code: location.code, name: location.name });
    setEditingLocation(location);
    setDialogMode('edit');
  };

  const handleSave = () => {
    if (dialogMode === 'create') {
      createMutation.mutate(form, {
        onSuccess: () => setDialogMode(null),
      });
    } else if (dialogMode === 'edit' && editingLocation) {
      const payload: UpdateLocationPayload = {};
      if (form.code !== editingLocation.code) payload.code = form.code;
      if (form.name !== editingLocation.name) payload.name = form.name;
      updateMutation.mutate({ id: editingLocation.id, ...payload }, {
        onSuccess: () => setDialogMode(null),
      });
    }
  };

  return (
    <div>
      <PageHeader
        title={t('locations.title')}
        subtitle={t('locations.subtitle')}
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => openCreateDialog('building')}>
              <Plus className="h-4 w-4" /> {t('locations.building')}
            </Button>
            <Button className="gap-2" onClick={() => openCreateDialog('unit')}>
              <Plus className="h-4 w-4" /> {t('locations.unit')}
            </Button>
          </div>
        }
      />

      <div className="mb-6">
        <label className="text-sm text-muted-foreground mb-2 block">{t('locations.selectProject')}</label>
        <Select value={selectedProject} onValueChange={(v) => { setSelectedProject(v); setExpandedBuilding(null); }}>
          <SelectTrigger className="max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <QueryBoundary isLoading={isLoading} isError={apiProjects ? isError : false} error={error}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard label={t('locations.buildings')} value={buildings.length} icon={<Building2 className="h-5 w-5" />} />
        <StatCard label={t('locations.totalUnits')} value={units.length} icon={<Home className="h-5 w-5" />} />
        <StatCard label={t('locations.totalFloors')} value={new Set(units.map((u) => u.floorNumber)).size} icon={<Layers className="h-5 w-5" />} />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buildings.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {t('locations.noBuildings')}
          </div>
        ) : (
          buildings.map((bldg) => {
            const isExpanded = expandedBuilding === bldg.id;
            const bldgUnits = units.filter((u) => u.unitNumber.startsWith(bldg.location.code.substring(0, 3)));
            const floors = [...new Set(bldgUnits.map((u) => u.floorNumber))].sort((a, b) => a - b);

            return (
              <Card key={bldg.id} className="glass-card border-border/50 overflow-hidden">
                <CardContent className="p-0">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedBuilding(isExpanded ? null : bldg.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold text-sm">{bldg.name}</p>
                        <p className="text-xs text-muted-foreground">{floors.length} {t('locations.floors')} · {bldgUnits.length} {t('locations.units')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(bldg.location)}>
                            <Pencil className="h-4 w-4 mr-2" /> {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteTarget(bldg.location)}>
                            <Trash2 className="h-4 w-4 mr-2" /> {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border/50 p-4 space-y-3 max-h-80 overflow-y-auto">
                      {floors.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">{t('locations.noUnits')}</p>
                      ) : (
                        floors.map((floor) => {
                          const floorUnits = bldgUnits.filter((u) => u.floorNumber === floor);
                          return (
                            <div key={floor}>
                              <p className="text-xs font-medium text-muted-foreground mb-2">{t('locations.floor')} {floor}</p>
                              <div className="space-y-1.5">
                                {floorUnits.map((unit) => (
                                  <div key={unit.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 text-xs">
                                    <div>
                                      <span className="font-medium">{unit.unitNumber}</span>
                                      <span className="text-muted-foreground ml-2">{unit.unitType}</span>
                                    </div>
                                    <StatusBadge status={unit.status} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      </QueryBoundary>

      <Dialog open={dialogMode !== null} onOpenChange={(open) => { if (!open) setDialogMode(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === 'create' ? 'Create ' + (form.nodeType === 'building' ? 'Building' : 'Unit') : 'Edit ' + (form.nodeType === 'building' ? 'Building' : 'Unit')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('locations.code')}</label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. BLD-01 or A-101" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('locations.name')}</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Building A or Apartment 101" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>{t('common.cancel')}</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {dialogMode === 'create' ? t('common.create') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common.deleteConfirmation')} &quot;{deleteTarget?.name}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deleteTarget) {
                deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
              }
            }}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

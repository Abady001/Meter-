'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateProject, useUpdateProject, type ProjectFormData } from '@/hooks/use-projects';
import { useT } from '@/lib/i18n/context';
import type { Project } from '@/lib/types';

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editProject?: Project | null;
}

export default function ProjectFormDialog({ open, onOpenChange, editProject }: ProjectFormDialogProps) {
  const t = useT();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const isEditing = !!editProject;

  const [code, setCode] = useState(isEditing ? editProject!.code : '');
  const [name, setName] = useState(isEditing ? editProject!.name : '');
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState('');
  const [waterDiffMode, setWaterDiffMode] = useState<'billable' | 'report_only'>('report_only');

  const handleSubmit = async () => {
    if (!code.trim() || !name.trim()) return;

    const data: ProjectFormData = {
      code: code.trim(),
      name: name.trim(),
      taxEnabled,
      taxRate: taxRate ? parseFloat(taxRate) : undefined,
      waterDifferenceMode: waterDiffMode,
    };

    try {
      if (isEditing && editProject) {
        await updateMutation.mutateAsync({ id: editProject.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onOpenChange(false);
    } catch {
      // Error handled by mutation
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('common.edit') : t('projects.create')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">{t('projects.code')}</Label>
            <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="PRJ-001" className="col-span-3" disabled={isEditing} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">{t('projects.name')}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Project Name" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Tax Enabled</Label>
            <Switch checked={taxEnabled} onCheckedChange={setTaxEnabled} />
          </div>
          {taxEnabled && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="taxRate" className="text-right">Tax Rate (%)</Label>
              <Input id="taxRate" type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} placeholder="15" className="col-span-3" />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Water Diff</Label>
            <Select value={waterDiffMode} onValueChange={(v) => setWaterDiffMode(v as 'billable' | 'report_only')}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="report_only">Report Only</SelectItem>
                <SelectItem value="billable">Billable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} disabled={!code.trim() || !name.trim() || isPending}>
            {isPending ? 'Saving...' : isEditing ? t('common.save') : t('projects.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

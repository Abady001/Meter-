'use client';

import { useState } from 'react';
import { Plus, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePageStore } from '@/lib/router-store';
import SmartTable from '@/components/smart-table/SmartTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageHeader } from '@/components/shared/PageHelpers';
import { formatDate } from '@/components/shared/PageHelpers';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { useT } from '@/lib/i18n/context';
import { useProjectsList, useDeleteProject } from '@/hooks/use-projects';
import ProjectFormDialog from '@/components/projects/ProjectFormDialog';

export default function ProjectsPage() {
  const t = useT();
  const { navigate } = usePageStore();
  const { data: apiProjects, isLoading, isError, error } = useProjectsList();
  const projects = apiProjects ?? [];
  const areas = [...new Set(projects.map((p) => p.area))];
  const deleteMutation = useDeleteProject();

  const [formOpen, setFormOpen] = useState(false);
  const [editProject, setEditProject] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const columns = [
    { key: 'code', label: t('projects.code'), sortable: true, width: '100px' },
    { key: 'name', label: t('projects.name'), sortable: true },
    { key: 'location', label: t('projects.location'), sortable: true },
    { key: 'area', label: t('projects.area'), sortable: true },
    { key: 'buildings', label: t('projects.buildings'), sortable: true, width: '90px' },
    { key: 'units', label: t('projects.units'), sortable: true, width: '80px' },
    { key: 'customers', label: t('projects.customerCount'), sortable: true, width: '100px' },
    { key: 'activeMeters', label: t('projects.activeMeters'), sortable: true, width: '110px' },
    {
      key: 'status', label: t('projects.status'), sortable: true, width: '110px',
      render: (val: string) => <StatusBadge status={val} />,
    },
    {
      key: 'createdAt', label: t('projects.created'), sortable: true, width: '110px',
      render: (val: string) => formatDate(val),
    },
    {
      key: 'actions', label: t('common.actions'), width: '60px',
      render: (_val: unknown, row: { id: string; name: string }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate('project-detail', { id: row.id }); }}>
              <Eye className="h-4 w-4 mr-2" /> {t('common.view')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditProject(row); setFormOpen(true); }}>
              <Pencil className="h-4 w-4 mr-2" /> {t('common.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }} className="text-red-500">
              <Trash2 className="h-4 w-4 mr-2" /> {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('projects.title')}
        subtitle={t('projects.subtitle')}
        action={
          <Button className="gap-2" onClick={() => { setEditProject(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> {t('projects.create')}
          </Button>
        }
      />
      <QueryBoundary isLoading={isLoading} isError={isError} error={error} isEmpty={!isLoading && projects.length === 0} emptyMessage={t('projects.noProjects')}>
      <SmartTable
        data={projects}
        columns={columns}
        filters={[
          {
            key: 'status', label: t('projects.status'), type: 'select',
            options: [
              { label: t('common.active'), value: 'active' },
              { label: t('common.inactive'), value: 'inactive' },
              { label: t('common.completed'), value: 'completed' },
              { label: t('common.archived'), value: 'archived' },
            ],
          },
          {
            key: 'area', label: t('projects.area'), type: 'select',
            options: areas.map((a) => ({ label: a, value: a })),
          },
        ]}
        onRowClick={(row) => navigate('project-detail', { id: row.id })}
        searchable
        searchPlaceholder={t('projects.search')}
      />
      </QueryBoundary>

      <ProjectFormDialog key={formOpen ? (editProject?.id ?? 'create') : 'closed'} open={formOpen} onOpenChange={setFormOpen} editProject={editProject} />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common.deleteWarning')} <strong>{deleteTarget?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              {deleteMutation.isPending ? 'Deleting...' : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


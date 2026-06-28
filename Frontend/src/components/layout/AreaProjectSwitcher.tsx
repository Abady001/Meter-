'use client';
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export function AreaProjectSwitcher() {
  const [areas, setAreas] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => {
    const savedArea = localStorage.getItem('selected-area') || '';
    const savedProject = localStorage.getItem('selected-project') || '';
    setSelectedArea(savedArea);
    setSelectedProject(savedProject);
    loadData();
  }, []);

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('mp-auth-token') : null;
    return token ? { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' } : {};
  };

  const loadData = async () => {
    try {
      const [aRes, pRes] = await Promise.all([
        fetch(`${API_URL}/areas`, { headers: getHeaders() }),
        fetch(`${API_URL}/projects`, { headers: getHeaders() }),
      ]);
      if (aRes.ok) {
        const aData = await aRes.json();
        const aList = Array.isArray(aData) ? aData : [];
        setAreas(aList);
      }
      if (pRes.ok) {
        const pData = await pRes.json();
        const pList = Array.isArray(pData) ? pData : [];
        setProjects(pList);
      }
    } catch {}
  };

  const handleArea = (val: string) => {
    const areaVal = val === '__all_areas__' ? '' : val;
    setSelectedArea(areaVal);
    setSelectedProject('');
    localStorage.setItem('selected-area', areaVal);
    localStorage.removeItem('selected-project');
    window.location.reload();
  };

  // Auto-select first project for the area as default
  useEffect(() => {
    if (selectedArea && !selectedProject) {
      const areaObj = areas.find((a: any) => a.id === selectedArea || a.areaCode === selectedArea);
      const areaProjects = selectedArea
        ? projects.filter((p: any) => p.areaId === (areaObj?.id || selectedArea))
        : [];
      if (areaProjects.length > 0) {
        const firstProj = areaProjects[0].id;
        setSelectedProject(firstProj);
        localStorage.setItem('selected-project', firstProj);
      }
    }
  }, [selectedArea, projects]);

  const handleProject = (val: string) => {
    const projVal = val === '__all_projects__' ? '' : val;
    setSelectedProject(projVal);
    localStorage.setItem('selected-project', projVal);
    window.location.reload();
  };

  // Filter projects by selected area (match by areaId or find area by code)
  const currentAreaObj = areas.find((a: any) => a.id === selectedArea || a.areaCode === selectedArea);
  const filteredProjects = selectedArea
    ? projects.filter((p: any) => p.areaId === (currentAreaObj?.id || selectedArea))
    : [];

  return (
    <div className="flex items-center gap-1.5">
      {/* Show current area badge only — selection happens at login */}
      {selectedArea ? (
        <Badge variant="outline" className="text-[11px] px-2 py-0 h-5 bg-muted/20 font-normal cursor-default">
          {areas.find(a => (a.id === selectedArea || a.areaCode === selectedArea))?.areaName || 'Area'}
        </Badge>
      ) : areas.length === 1 ? (
        <Badge variant="outline" className="text-[11px] px-2 py-0 h-5 bg-muted/20 font-normal cursor-default">
          {areas[0]?.areaName || areas[0]?.name || 'Area'}
        </Badge>
      ) : null}

      {/* Project selector — defaults to first project for the area */}
      {filteredProjects.length > 0 ? (
        <Select value={selectedProject || filteredProjects[0]?.id || ''} onValueChange={handleProject}>
          <SelectTrigger className="h-7 w-[130px] text-[11px] border-border/40">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            {filteredProjects.map((p: any) => (
              <SelectItem key={p.id} value={p.id}>
                {p.projectName || p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : filteredProjects.length === 1 ? (
        <Badge variant="outline" className="text-[11px] px-2 py-0 h-5 bg-muted/20 font-normal cursor-default">
          {filteredProjects[0]?.projectName || filteredProjects[0]?.name || 'Project'}
        </Badge>
      ) : null}
    </div>
  );
}

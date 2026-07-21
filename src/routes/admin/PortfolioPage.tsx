import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Layers,
  Plus,
  Edit3,
  Copy,
  Eye,
  Archive,
  Trash2,
  Send,
  FileEdit,
  X,
  Upload,
} from 'lucide-react';
import { ActionButton } from '../../components/admin/ActionButton';
import { portfolioRepository } from '../../repositories/portfolioRepository';
import type { Project, ProjectStatus } from '../../domain/project/project.types';

// ─── Status badge colors ──────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  PUBLISHED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  ARCHIVED: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' },
};

// ─── Slug Generator ───────────────────────────────────────────────────────────

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ─── Page Component ───────────────────────────────────────────────────────────

export const AdminPortfolioPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProjectStatus>('ALL');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<ProjectStatus>('DRAFT');
  const [formFeaturedRank, setFormFeaturedRank] = useState<string>('');
  const [formDisplayOrder, setFormDisplayOrder] = useState<string>('0');
  const [formTechStack, setFormTechStack] = useState('');
  const [formServices, setFormServices] = useState('');
  const [formOverview, setFormOverview] = useState('');
  const [formChallenge, setFormChallenge] = useState('');
  const [formSolution, setFormSolution] = useState('');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formMetaDesc, setFormMetaDesc] = useState('');
  const [formCoverPath, setFormCoverPath] = useState('');

  // Metrics form
  const [formMetrics, setFormMetrics] = useState<Array<{ metric_type: string; display_prefix: string; value: string; suffix: string; label: string }>>([]);

  // Links form
  const [formLinks, setFormLinks] = useState<Array<{ link_type: "LIVE_WEBSITE" | "GITHUB" | "FIGMA" | "CASE_STUDY_PDF" | "YOUTUBE" | "OTHER"; url: string; label: string }>>([]);

  const [isSaving, setIsSaving] = useState(false);

  // ── Data Queries ────────────────────────────────────────────────────────

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin', 'portfolio', 'all'],
    queryFn: () => portfolioRepository.getAllProjects(),
    staleTime: 30 * 1000,
  });

  // Filter by status
  const filteredProjects = statusFilter === 'ALL'
    ? projects
    : projects.filter(p => p.status === statusFilter);

  // ── Form Helpers ────────────────────────────────────────────────────────

  const resetForm = () => {
    setFormTitle('');
    setFormSlug('');
    setFormDescription('');
    setFormStatus('DRAFT');
    setFormFeaturedRank('');
    setFormDisplayOrder('0');
    setFormTechStack('');
    setFormServices('');
    setFormOverview('');
    setFormChallenge('');
    setFormSolution('');
    setFormSeoTitle('');
    setFormMetaDesc('');
    setFormCoverPath('');
    setFormMetrics([]);
    setFormLinks([]);
    setEditingProject(null);
  };

  const openCreateDrawer = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (project: Project) => {
    setEditingProject(project);
    setFormTitle(project.title);
    setFormSlug(project.slug);
    setFormDescription(project.description ?? '');
    setFormStatus(project.status ?? 'DRAFT');
    setFormFeaturedRank(project.featured_rank?.toString() ?? '');
    setFormDisplayOrder(project.display_order?.toString() ?? '0');
    setFormTechStack((project.technology_stack ?? []).join(', '));
    setFormServices((project.services ?? []).join(', '));
    setFormOverview(project.overview ?? '');
    setFormChallenge(project.challenge ?? '');
    setFormSolution(project.solution ?? '');
    setFormSeoTitle(project.seo_title ?? '');
    setFormMetaDesc(project.meta_description ?? '');
    setFormCoverPath(project.cover_image_path ?? '');
    setFormMetrics(
      (project.metrics ?? []).map(m => ({
        metric_type: m.metric_type,
        display_prefix: m.display_prefix ?? '',
        value: m.value.toString(),
        suffix: m.suffix ?? '',
        label: m.label,
      }))
    );
    setFormLinks(
      (project.links ?? []).map(l => ({
        link_type: l.link_type,
        url: l.url,
        label: l.label ?? '',
      }))
    );
    setIsDrawerOpen(true);
  };

  const handleTitleChange = (title: string) => {
    setFormTitle(title);
    if (!editingProject) {
      setFormSlug(generateSlug(title));
    }
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formSlug.trim()) return;
    setIsSaving(true);

    const projectData: Partial<Project> = {
      title: formTitle.trim(),
      slug: formSlug.trim(),
      description: formDescription.trim() || undefined,
      status: formStatus,
      featured_rank: formFeaturedRank ? parseInt(formFeaturedRank) : undefined,
      display_order: parseInt(formDisplayOrder) || 0,
      technology_stack: formTechStack.split(',').map(s => s.trim()).filter(Boolean),
      services: formServices.split(',').map(s => s.trim()).filter(Boolean),
      overview: formOverview.trim() || undefined,
      challenge: formChallenge.trim() || undefined,
      solution: formSolution.trim() || undefined,
      seo_title: formSeoTitle.trim() || undefined,
      meta_description: formMetaDesc.trim() || undefined,
      cover_image_path: formCoverPath.trim() || undefined,
    };

    let savedProject: Project | null = null;

    if (editingProject) {
      savedProject = await portfolioRepository.updateProject(editingProject.id, projectData);
    } else {
      savedProject = await portfolioRepository.createProject(projectData);
    }

    if (savedProject) {
      // Upsert metrics
      if (formMetrics.length > 0) {
        await portfolioRepository.upsertMetrics(
          savedProject.id,
          formMetrics.map((m, idx) => ({
            metric_type: m.metric_type,
            display_prefix: m.display_prefix || undefined,
            value: parseFloat(m.value) || 0,
            suffix: m.suffix || undefined,
            label: m.label,
            sort_order: idx,
          }))
        );
      }

      // Upsert links
      if (formLinks.length > 0) {
        await portfolioRepository.upsertLinks(
          savedProject.id,
          formLinks.map((l, idx) => ({
            link_type: l.link_type,
            url: l.url,
            label: l.label || undefined,
            display_order: idx,
          }))
        );
      }
    }

    queryClient.invalidateQueries({ queryKey: ['admin', 'portfolio'] });
    queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    setIsDrawerOpen(false);
    resetForm();
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    await portfolioRepository.deleteProject(id);
    queryClient.invalidateQueries({ queryKey: ['admin', 'portfolio'] });
    queryClient.invalidateQueries({ queryKey: ['portfolio'] });
  };

  const handleClone = async (id: string) => {
    setActionLoading(`clone-${id}`);
    try {
      await portfolioRepository.cloneProject(id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'portfolio'] });
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (id: string, status: ProjectStatus) => {
    if (status === 'ARCHIVED' && !confirm('Are you sure you want to archive this project? It will no longer be visible to the public.')) return;
    setActionLoading(`status-${id}`);
    try {
      await portfolioRepository.updateStatus(id, status);
      queryClient.invalidateQueries({ queryKey: ['admin', 'portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = await portfolioRepository.uploadMedia(file);
    if (path) setFormCoverPath(path);
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#0B3027]/10">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#C9A56A]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#9A7B4F] font-bold">
              Portfolio CMS • Showcase Manager
            </span>
          </div>
          <h1 className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027] mt-1">
            Portfolio Manager
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-[#C9A56A]/15 border border-[#C9A56A]/35 text-xs font-mono font-bold text-[#9A7B4F]">
            {projects.length} Projects
          </span>
          <button
            onClick={openCreateDrawer}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B3027] hover:bg-[#0E3A2F] text-white font-semibold text-xs shadow-[0_4px_16px_rgba(11,48,39,0.25)] transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-[#C9A56A]" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'] as const).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-sm ${
              statusFilter === status
                ? 'bg-[#0B3027] text-[#F8F6F1] shadow-md'
                : 'bg-white text-[#0B3027]/70 hover:text-[#0B3027] border border-[#0B3027]/10'
            }`}
          >
            {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            <span className="ml-1.5 text-[10px] font-mono opacity-60">
              {status === 'ALL' ? projects.length : projects.filter(p => p.status === status).length}
            </span>
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-[#0B3027]/20 border-t-[#0B3027] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProjects.map(project => {
            const coverUrl = project.images?.cover || (project.cover_image_path?.startsWith('/') ? project.cover_image_path : '');
            const statusStyle = STATUS_STYLES[project.status ?? 'DRAFT'] || STATUS_STYLES['DRAFT'];
            const projectMetrics = project.metrics ?? [];

            return (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-[#0B3027]/[0.08] overflow-hidden hover:border-[#C9A56A]/30 transition-all duration-300 shadow-sm hover:shadow-md group"
              >
                {/* Cover thumbnail */}
                <div className="aspect-[16/9] bg-[#F5F2EB] relative overflow-hidden">
                  {coverUrl ? (
                    <img src={coverUrl} alt={project.title} className="w-full h-full object-cover object-top" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0B3027] to-[#0E3A2F] flex items-center justify-center">
                      <Layers className="w-8 h-8 text-[#C9A56A]/30" />
                    </div>
                  )}

                  {/* Status badge */}
                  <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                    {project.status}
                  </div>

                  {/* Featured rank */}
                  {project.featured_rank && (
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#C9A56A] flex items-center justify-center text-[#0B3027] text-[11px] font-bold shadow-md">
                      {project.featured_rank}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-['Cormorant_Garamond'] text-lg font-bold text-[#0B3027] leading-snug">{project.title}</h3>
                      <span className="text-[10px] font-mono text-[#0B3027]/40">/{project.slug}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#0B3027]/30 shrink-0">#{project.display_order}</span>
                  </div>

                  {project.description && (
                    <p className="text-[#0B3027]/55 text-xs leading-relaxed line-clamp-2">{project.description}</p>
                  )}

                  {/* Metrics preview */}
                  {projectMetrics.length > 0 && (
                    <div className="flex gap-3 mt-1">
                      {projectMetrics.slice(0, 2).map((m, idx) => (
                        <span key={idx} className="text-[11px] font-semibold text-[#C9A56A]">
                          {m.display_prefix}{m.value}{m.suffix} <span className="text-[#0B3027]/40 font-normal">{m.label}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 mt-2 pt-3 border-t border-[#0B3027]/[0.06]">
                    <button disabled={!!actionLoading} onClick={() => openEditDrawer(project)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-[#0B3027]/60 hover:bg-[#0B3027]/[0.04] transition-all disabled:opacity-50" title="Edit">
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button disabled={!!actionLoading} onClick={() => handleClone(project.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-[#0B3027]/60 hover:bg-[#0B3027]/[0.04] transition-all disabled:opacity-50" title="Clone">
                      <Copy className="w-3 h-3" /> {actionLoading === `clone-${project.id}` ? '...' : 'Clone'}
                    </button>
                    <button disabled={!!actionLoading} onClick={() => window.open(`/portfolio/${project.slug}`, '_blank')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-[#0B3027]/60 hover:bg-[#0B3027]/[0.04] transition-all disabled:opacity-50" title="Preview">
                      <Eye className="w-3 h-3" /> Preview
                    </button>

                    <div className="flex-1" />

                    {project.status === 'DRAFT' && (
                      <ActionButton actionId="portfolio.publish" onAction={() => handleStatusChange(project.id, 'PUBLISHED')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all">
                        <Send className="w-3 h-3" /> Publish
                      </ActionButton>
                    )}
                    {project.status === 'PUBLISHED' && (
                      <button disabled={!!actionLoading} onClick={() => handleStatusChange(project.id, 'ARCHIVED')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all disabled:opacity-50">
                        <Archive className="w-3 h-3" /> {actionLoading === `status-${project.id}` ? '...' : 'Archive'}
                      </button>
                    )}
                    {project.status === 'ARCHIVED' && (
                      <button disabled={!!actionLoading} onClick={() => handleStatusChange(project.id, 'DRAFT')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 transition-all disabled:opacity-50">
                        <FileEdit className="w-3 h-3" /> {actionLoading === `status-${project.id}` ? '...' : 'Revise'}
                      </button>
                    )}

                    <ActionButton actionId="portfolio.delete" onAction={() => handleDelete(project.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all" title="Delete">
                      <Trash2 className="w-3 h-3" />
                    </ActionButton>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredProjects.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3">
              <Layers className="w-10 h-10 text-[#0B3027]/15" />
              <p className="text-[#0B3027]/40 text-sm">No projects found.</p>
              <button onClick={openCreateDrawer} className="text-[#C9A56A] text-xs font-semibold hover:underline">
                Create your first project →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Slide-Over Drawer ──────────────────────────────────────── */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setIsDrawerOpen(false); resetForm(); }} />
          <div className="relative w-full max-w-2xl bg-[#FAF7F0] shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer header */}
            <div className="sticky top-0 z-10 bg-[#FAF7F0] border-b border-[#0B3027]/10 px-8 py-5 flex items-center justify-between">
              <div>
                <h2 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027]">
                  {editingProject ? 'Edit Project' : 'New Project'}
                </h2>
                <span className="text-[10px] font-mono text-[#0B3027]/40">{formSlug ? `/${formSlug}` : ''}</span>
              </div>
              <button onClick={() => { setIsDrawerOpen(false); resetForm(); }} className="p-2 rounded-lg hover:bg-[#0B3027]/[0.05] transition-all">
                <X className="w-5 h-5 text-[#0B3027]/50" />
              </button>
            </div>

            {/* Drawer body */}
            <div className="px-8 py-6 space-y-8 flex-1 overflow-y-auto">
              {/* Core */}
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C9A56A]">Core Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#0B3027]/70 block mb-1">Title</label>
                    <input value={formTitle} onChange={e => handleTitleChange(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-[#0B3027]/10 bg-white text-sm text-[#0B3027] focus:border-[#C9A56A] focus:outline-none transition-colors" placeholder="e.g. Bhavanam Restaurant" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#0B3027]/70 block mb-1">Slug</label>
                    <input value={formSlug} onChange={e => setFormSlug(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-[#0B3027]/10 bg-white text-sm font-mono text-[#0B3027] focus:border-[#C9A56A] focus:outline-none transition-colors" placeholder="bhavanam-restaurant" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#0B3027]/70 block mb-1">Description</label>
                    <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-[#0B3027]/10 bg-white text-sm text-[#0B3027] focus:border-[#C9A56A] focus:outline-none transition-colors resize-none" placeholder="Brief project description..." />
                  </div>
                </div>
              </div>

              {/* Media */}
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C9A56A]">Media</h3>
                <div>
                  <label className="text-[11px] font-semibold text-[#0B3027]/70 block mb-1">Cover Image</label>
                  {formCoverPath && (
                    <div className="mb-2 rounded-lg overflow-hidden border border-[#0B3027]/[0.06] aspect-video bg-[#F5F2EB]">
                      <img src={formCoverPath.startsWith('/') ? formCoverPath : portfolioRepository.getPublicImageUrl(formCoverPath)} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[#0B3027]/15 bg-white cursor-pointer hover:border-[#C9A56A]/40 transition-all">
                    <Upload className="w-4 h-4 text-[#C9A56A]" />
                    <span className="text-xs text-[#0B3027]/60">Upload cover image</span>
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  </label>
                  <div className="mt-2">
                    <input value={formCoverPath} onChange={e => setFormCoverPath(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-[#0B3027]/10 bg-white text-xs font-mono text-[#0B3027]/60 focus:border-[#C9A56A] focus:outline-none" placeholder="Or enter storage path manually" />
                  </div>
                </div>
              </div>

              {/* Classification */}
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C9A56A]">Classification</h3>
                <div>
                  <label className="text-[11px] font-semibold text-[#0B3027]/70 block mb-1">Technology Stack <span className="font-normal text-[#0B3027]/40">(comma separated)</span></label>
                  <input value={formTechStack} onChange={e => setFormTechStack(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-[#0B3027]/10 bg-white text-sm text-[#0B3027] focus:border-[#C9A56A] focus:outline-none" placeholder="React, Supabase, Framer Motion" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#0B3027]/70 block mb-1">Services <span className="font-normal text-[#0B3027]/40">(comma separated)</span></label>
                  <input value={formServices} onChange={e => setFormServices(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-[#0B3027]/10 bg-white text-sm text-[#0B3027] focus:border-[#C9A56A] focus:outline-none" placeholder="UI/UX Design, Web Development" />
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C9A56A]">Impact Metrics</h3>
                  <button onClick={() => setFormMetrics([...formMetrics, { metric_type: '', display_prefix: '+', value: '', suffix: '%', label: '' }])} className="text-[10px] font-semibold text-[#C9A56A] hover:underline">
                    + Add Metric
                  </button>
                </div>
                {formMetrics.map((metric, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-white border border-[#0B3027]/[0.06]">
                    <input value={metric.display_prefix} onChange={e => { const m = [...formMetrics]; m[idx].display_prefix = e.target.value; setFormMetrics(m); }} className="w-10 px-2 py-1.5 rounded border border-[#0B3027]/10 text-xs text-center" placeholder="+" />
                    <input value={metric.value} onChange={e => { const m = [...formMetrics]; m[idx].value = e.target.value; setFormMetrics(m); }} className="w-16 px-2 py-1.5 rounded border border-[#0B3027]/10 text-xs" placeholder="180" />
                    <input value={metric.suffix} onChange={e => { const m = [...formMetrics]; m[idx].suffix = e.target.value; setFormMetrics(m); }} className="w-10 px-2 py-1.5 rounded border border-[#0B3027]/10 text-xs text-center" placeholder="%" />
                    <input value={metric.label} onChange={e => { const m = [...formMetrics]; m[idx].label = e.target.value; setFormMetrics(m); }} className="flex-1 px-2 py-1.5 rounded border border-[#0B3027]/10 text-xs" placeholder="Label (e.g. Increase)" />
                    <input value={metric.metric_type} onChange={e => { const m = [...formMetrics]; m[idx].metric_type = e.target.value; setFormMetrics(m); }} className="w-28 px-2 py-1.5 rounded border border-[#0B3027]/10 text-xs" placeholder="Type" />
                    <button onClick={() => setFormMetrics(formMetrics.filter((_, i) => i !== idx))} className="p-1 text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>

              {/* Links */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C9A56A]">Project Links</h3>
                  <button onClick={() => setFormLinks([...formLinks, { link_type: 'LIVE_WEBSITE', url: '', label: '' }])} className="text-[10px] font-semibold text-[#C9A56A] hover:underline">
                    + Add Link
                  </button>
                </div>
                {formLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-white border border-[#0B3027]/[0.06]">
                    <select value={link.link_type} onChange={e => { const l = [...formLinks]; l[idx].link_type = e.target.value as any; setFormLinks(l); }} className="px-2 py-1.5 rounded border border-[#0B3027]/10 text-xs bg-white">
                      <option value="LIVE_WEBSITE">Live Website</option>
                      <option value="GITHUB">GitHub</option>
                      <option value="FIGMA">Figma</option>
                      <option value="YOUTUBE">YouTube</option>
                      <option value="CASE_STUDY_PDF">PDF</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <input value={link.url} onChange={e => { const l = [...formLinks]; l[idx].url = e.target.value; setFormLinks(l); }} className="flex-1 px-2 py-1.5 rounded border border-[#0B3027]/10 text-xs" placeholder="https://..." />
                    <input value={link.label} onChange={e => { const l = [...formLinks]; l[idx].label = e.target.value; setFormLinks(l); }} className="w-32 px-2 py-1.5 rounded border border-[#0B3027]/10 text-xs" placeholder="Label" />
                    <button onClick={() => setFormLinks(formLinks.filter((_, i) => i !== idx))} className="p-1 text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>

              {/* Case Study */}
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C9A56A]">Case Study Content</h3>
                <div>
                  <label className="text-[11px] font-semibold text-[#0B3027]/70 block mb-1">Overview</label>
                  <textarea value={formOverview} onChange={e => setFormOverview(e.target.value)} rows={4} className="w-full px-4 py-2.5 rounded-lg border border-[#0B3027]/10 bg-white text-sm text-[#0B3027] focus:border-[#C9A56A] focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#0B3027]/70 block mb-1">Challenge</label>
                  <textarea value={formChallenge} onChange={e => setFormChallenge(e.target.value)} rows={4} className="w-full px-4 py-2.5 rounded-lg border border-[#0B3027]/10 bg-white text-sm text-[#0B3027] focus:border-[#C9A56A] focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#0B3027]/70 block mb-1">Solution</label>
                  <textarea value={formSolution} onChange={e => setFormSolution(e.target.value)} rows={4} className="w-full px-4 py-2.5 rounded-lg border border-[#0B3027]/10 bg-white text-sm text-[#0B3027] focus:border-[#C9A56A] focus:outline-none resize-none" />
                </div>
              </div>

              {/* Display & SEO */}
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C9A56A]">Display & SEO</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#0B3027]/70 block mb-1">Status</label>
                    <select value={formStatus} onChange={e => setFormStatus(e.target.value as ProjectStatus)} className="w-full px-3 py-2.5 rounded-lg border border-[#0B3027]/10 bg-white text-xs font-semibold focus:border-[#C9A56A] focus:outline-none">
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#0B3027]/70 block mb-1">Featured Rank</label>
                    <input value={formFeaturedRank} onChange={e => setFormFeaturedRank(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-[#0B3027]/10 bg-white text-xs focus:border-[#C9A56A] focus:outline-none" placeholder="1, 2, 3 or empty" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#0B3027]/70 block mb-1">Display Order</label>
                    <input value={formDisplayOrder} onChange={e => setFormDisplayOrder(e.target.value)} type="number" className="w-full px-3 py-2.5 rounded-lg border border-[#0B3027]/10 bg-white text-xs focus:border-[#C9A56A] focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#0B3027]/70 block mb-1">SEO Title</label>
                  <input value={formSeoTitle} onChange={e => setFormSeoTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-[#0B3027]/10 bg-white text-sm text-[#0B3027] focus:border-[#C9A56A] focus:outline-none" placeholder="Custom SEO title" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#0B3027]/70 block mb-1">Meta Description</label>
                  <textarea value={formMetaDesc} onChange={e => setFormMetaDesc(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-[#0B3027]/10 bg-white text-sm text-[#0B3027] focus:border-[#C9A56A] focus:outline-none resize-none" placeholder="SEO meta description" />
                </div>
              </div>
            </div>

            {/* Drawer footer */}
            <div className="sticky bottom-0 bg-[#FAF7F0] border-t border-[#0B3027]/10 px-8 py-5 flex items-center justify-between">
              <button onClick={() => { setIsDrawerOpen(false); resetForm(); }} className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#0B3027]/60 hover:bg-[#0B3027]/[0.05] transition-all">
                Cancel
              </button>
              <div className="flex items-center gap-3">
                {editingProject && (
                  <button
                    onClick={() => window.open(`/portfolio/${formSlug}`, '_blank')}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-[#0B3027]/70 border border-[#0B3027]/10 hover:border-[#C9A56A]/30 transition-all"
                  >
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving || !formTitle.trim() || !formSlug.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0B3027] text-white text-xs font-bold hover:bg-[#0E3A2F] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-[#C9A56A]" />
                  )}
                  <span>{editingProject ? 'Update Project' : 'Create Project'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

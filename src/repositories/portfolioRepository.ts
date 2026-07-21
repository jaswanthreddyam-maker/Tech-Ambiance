import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  Project,
  PortfolioCategory,
  PortfolioMetric,
  PortfolioMedia,
  PortfolioLink,
  ProjectStatus,
} from '../domain/project/project.types';
import { PORTFOLIO_PROJECTS } from '../content/portfolioProjects';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate a public URL for a Supabase Storage path in the 'portfolio' bucket.
 */
function getPublicImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  // If it's already an absolute URL or a local /assets path, return as-is
  if (path.startsWith('http') || path.startsWith('/')) return path;
  if (!isSupabaseConfigured) return '';
  const { data } = supabase.storage.from('portfolio').getPublicUrl(path);
  return data?.publicUrl ?? '';
}

/**
 * Map a raw Supabase portfolio_projects row (with joined relations) into the
 * unified Project shape used by the frontend.
 */
function mapRowToProject(row: any): Project {
  const categories: PortfolioCategory[] = (row.portfolio_project_categories ?? []).map((jpc: any) => jpc.portfolio_categories).filter(Boolean);
  const metrics: PortfolioMetric[] = (row.portfolio_metrics ?? []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const media: PortfolioMedia[] = (row.portfolio_media ?? []).sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));
  const links: PortfolioLink[] = (row.portfolio_project_links ?? []).sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));

  // Build legacy compatibility fields
  const primaryCategory = categories[0];
  const businessImpact = metrics.map(m => ({
    metric: m.metric_type,
    value: `${m.display_prefix ?? ''}${m.value}${m.suffix ?? ''}`,
    label: m.label,
  }));
  const primaryLink = links.find(l => l.link_type === 'LIVE_WEBSITE');

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? undefined,
    cover_image_path: row.cover_image_path ?? undefined,
    status: row.status,
    featured_rank: row.featured_rank ?? undefined,
    display_order: row.display_order ?? 0,
    technology_stack: row.technology_stack ?? [],
    services: row.services ?? [],
    overview: row.overview ?? undefined,
    challenge: row.challenge ?? undefined,
    solution: row.solution ?? undefined,
    seo_title: row.seo_title ?? undefined,
    meta_description: row.meta_description ?? undefined,
    og_image_path: row.og_image_path ?? undefined,
    canonical_url: row.canonical_url ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,

    // Joined relations
    categories,
    metrics,
    media,
    links,

    // Legacy compatibility
    industry: primaryCategory?.name ?? '',
    businessImpact,
    images: {
      cover: getPublicImageUrl(row.cover_image_path) || (row.cover_image_path?.startsWith('/') ? row.cover_image_path : ''),
      gallery: media.filter(m => m.media_type === 'IMAGE').map(m => getPublicImageUrl(m.path)),
    },
    featured: row.featured_rank != null,
    url: primaryLink?.url ?? undefined,
  };
}

// ─── Select query with all joins ──────────────────────────────────────────────

const PROJECT_SELECT = `
  *,
  portfolio_project_categories (
    portfolio_categories (*)
  ),
  portfolio_metrics (*),
  portfolio_media (*),
  portfolio_project_links (*)
`;

// ─── Repository ───────────────────────────────────────────────────────────────

export const portfolioRepository = {

  // ── Public Reads ──────────────────────────────────────────────────────────

  /**
   * Get all published portfolio projects, ordered by display_order.
   * Falls back to local content if Supabase is unavailable.
   */
  async getPublishedProjects(): Promise<Project[]> {
    if (!isSupabaseConfigured) return PORTFOLIO_PROJECTS;

    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select(PROJECT_SELECT)
        .eq('status', 'PUBLISHED')
        .order('display_order', { ascending: true });

      if (error || !data) {
        console.warn('[portfolioRepository] Supabase fetch failed, using fallback:', error?.message);
        return PORTFOLIO_PROJECTS;
      }

      return data.map(mapRowToProject);
    } catch {
      return PORTFOLIO_PROJECTS;
    }
  },

  /**
   * Get a single project by slug with all relations.
   */
  async getProjectBySlug(slug: string): Promise<Project | null> {
    if (!isSupabaseConfigured) {
      return PORTFOLIO_PROJECTS.find(p => p.slug === slug) ?? null;
    }

    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select(PROJECT_SELECT)
        .eq('slug', slug)
        .single();

      if (error || !data) {
        // Fallback to local content
        return PORTFOLIO_PROJECTS.find(p => p.slug === slug) ?? null;
      }

      return mapRowToProject(data);
    } catch {
      return PORTFOLIO_PROJECTS.find(p => p.slug === slug) ?? null;
    }
  },

  /**
   * Get featured projects ordered by featured_rank.
   */
  async getFeaturedProjects(): Promise<Project[]> {
    if (!isSupabaseConfigured) {
      return PORTFOLIO_PROJECTS.filter(p => p.featured);
    }

    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select(PROJECT_SELECT)
        .eq('status', 'PUBLISHED')
        .not('featured_rank', 'is', null)
        .order('featured_rank', { ascending: true });

      if (error || !data) {
        return PORTFOLIO_PROJECTS.filter(p => p.featured);
      }

      return data.map(mapRowToProject);
    } catch {
      return PORTFOLIO_PROJECTS.filter(p => p.featured);
    }
  },

  /**
   * Get all portfolio categories.
   */
  async getCategories(): Promise<PortfolioCategory[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from('portfolio_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data) {
        console.error('[portfolioRepository] getCategories error:', error);
        return [];
      }
      return data as PortfolioCategory[];
    } catch {
      return [];
    }
  },

  // ── Admin Reads ───────────────────────────────────────────────────────────

  /**
   * Get ALL projects (all statuses) for admin management.
   */
  async getAllProjects(): Promise<Project[]> {
    if (!isSupabaseConfigured) return PORTFOLIO_PROJECTS;

    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select(PROJECT_SELECT)
        .order('display_order', { ascending: true });

      if (error || !data) return PORTFOLIO_PROJECTS;
      return data.map(mapRowToProject);
    } catch {
      return PORTFOLIO_PROJECTS;
    }
  },

  // ── Admin Writes ──────────────────────────────────────────────────────────

  /**
   * Create a new portfolio project.
   */
  async createProject(projectData: Partial<Project>): Promise<Project | null> {
    if (!isSupabaseConfigured) {
      const mockProject: Project = {
        id: `mock-${Date.now()}`,
        slug: projectData.slug || `mock-${Date.now()}`,
        title: projectData.title || 'Untitled',
        description: projectData.description,
        cover_image_path: projectData.cover_image_path,
        status: projectData.status ?? 'DRAFT',
        featured_rank: projectData.featured_rank,
        display_order: projectData.display_order ?? PORTFOLIO_PROJECTS.length,
        technology_stack: projectData.technology_stack ?? [],
        services: projectData.services ?? [],
        overview: projectData.overview,
        challenge: projectData.challenge,
        solution: projectData.solution,
        seo_title: projectData.seo_title,
        meta_description: projectData.meta_description,
        og_image_path: projectData.og_image_path,
        canonical_url: projectData.canonical_url,
        metrics: [],
        links: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      PORTFOLIO_PROJECTS.push(mockProject);
      return mockProject;
    }

    const { data, error } = await supabase
      .from('portfolio_projects')
      .insert({
        slug: projectData.slug,
        title: projectData.title,
        description: projectData.description,
        cover_image_path: projectData.cover_image_path,
        status: projectData.status ?? 'DRAFT',
        featured_rank: projectData.featured_rank,
        display_order: projectData.display_order ?? 0,
        technology_stack: projectData.technology_stack ?? [],
        services: projectData.services ?? [],
        overview: projectData.overview,
        challenge: projectData.challenge,
        solution: projectData.solution,
        seo_title: projectData.seo_title,
        meta_description: projectData.meta_description,
        og_image_path: projectData.og_image_path,
        canonical_url: projectData.canonical_url,
      })
      .select(PROJECT_SELECT)
      .single();

    if (error || !data) {
      console.error('[portfolioRepository] createProject error:', error?.message);
      return null;
    }

    return mapRowToProject(data);
  },

  /**
   * Update an existing portfolio project.
   */
  async updateProject(id: string, projectData: Partial<Project>): Promise<Project | null> {
    if (!isSupabaseConfigured) {
      const idx = PORTFOLIO_PROJECTS.findIndex(p => p.id === id);
      if (idx !== -1) {
        PORTFOLIO_PROJECTS[idx] = { ...PORTFOLIO_PROJECTS[idx], ...projectData };
        return PORTFOLIO_PROJECTS[idx];
      }
      return null;
    }

    const { data, error } = await supabase
      .from('portfolio_projects')
      .update({
        slug: projectData.slug,
        title: projectData.title,
        description: projectData.description,
        cover_image_path: projectData.cover_image_path,
        status: projectData.status,
        featured_rank: projectData.featured_rank,
        display_order: projectData.display_order,
        technology_stack: projectData.technology_stack,
        services: projectData.services,
        overview: projectData.overview,
        challenge: projectData.challenge,
        solution: projectData.solution,
        seo_title: projectData.seo_title,
        meta_description: projectData.meta_description,
        og_image_path: projectData.og_image_path,
        canonical_url: projectData.canonical_url,
      })
      .eq('id', id)
      .select(PROJECT_SELECT)
      .single();

    if (error || !data) {
      console.error('[portfolioRepository] updateProject error:', error?.message);
      return null;
    }

    return mapRowToProject(data);
  },

  /**
   * Update project status (Draft → Published → Archived).
   */
  async updateStatus(id: string, status: ProjectStatus): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { error } = await supabase
      .from('portfolio_projects')
      .update({ status })
      .eq('id', id);

    if (error) console.error('[portfolioRepository] updateStatus error:', error);
    return !error;
  },

  /**
   * Clone a project as a new DRAFT with " (Copy)" suffix.
   */
  async cloneProject(id: string): Promise<Project | null> {
    if (!isSupabaseConfigured) {
      const source = PORTFOLIO_PROJECTS.find(p => p.id === id);
      if (!source) return null;
      const clone = { ...source, id: `mock-${Date.now()}`, title: `${source.title} (Copy)`, slug: `${source.slug}-copy`, status: 'DRAFT' as ProjectStatus };
      PORTFOLIO_PROJECTS.push(clone);
      return clone;
    }

    // Fetch the source project with all relations
    const { data: source, error: fetchErr } = await supabase
      .from('portfolio_projects')
      .select(PROJECT_SELECT)
      .eq('id', id)
      .single();

    if (fetchErr || !source) {
      console.error('[portfolioRepository] cloneProject source fetch error:', fetchErr);
      return null;
    }

    // Insert cloned project
    const { data: cloned, error: insertErr } = await supabase
      .from('portfolio_projects')
      .insert({
        slug: `${source.slug}-copy`,
        title: `${source.title} (Copy)`,
        description: source.description,
        cover_image_path: source.cover_image_path,
        status: 'DRAFT',
        featured_rank: null,
        display_order: (source.display_order ?? 0) + 1,
        technology_stack: source.technology_stack,
        services: source.services,
        overview: source.overview,
        challenge: source.challenge,
        solution: source.solution,
        seo_title: source.seo_title,
        meta_description: source.meta_description,
        og_image_path: source.og_image_path,
        canonical_url: null,
      })
      .select()
      .single();

    if (insertErr || !cloned) {
      console.error('[portfolioRepository] cloneProject insert error:', insertErr);
      return null;
    }

    // Clone metrics
    const sourceMetrics = source.portfolio_metrics ?? [];
    if (sourceMetrics.length > 0) {
      await supabase.from('portfolio_metrics').insert(
        sourceMetrics.map((m: any) => ({
          project_id: cloned.id,
          metric_type: m.metric_type,
          display_prefix: m.display_prefix,
          value: m.value,
          suffix: m.suffix,
          label: m.label,
          sort_order: m.sort_order,
        }))
      );
    }

    // Clone category associations
    const sourceCats = source.portfolio_project_categories ?? [];
    if (sourceCats.length > 0) {
      await supabase.from('portfolio_project_categories').insert(
        sourceCats.map((jpc: any) => ({
          project_id: cloned.id,
          category_id: jpc.portfolio_categories?.id ?? jpc.category_id,
        }))
      );
    }

    // Clone links
    const sourceLinks = source.portfolio_project_links ?? [];
    if (sourceLinks.length > 0) {
      await supabase.from('portfolio_project_links').insert(
        sourceLinks.map((l: any) => ({
          project_id: cloned.id,
          link_type: l.link_type,
          url: l.url,
          label: l.label,
          display_order: l.display_order,
        }))
      );
    }

    // Re-fetch the full cloned project with relations
    return this.getProjectBySlug(cloned.slug);
  },

  /**
   * Delete a portfolio project (cascade deletes metrics, media, links, categories).
   */
  async deleteProject(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const idx = PORTFOLIO_PROJECTS.findIndex(p => p.id === id);
      if (idx !== -1) PORTFOLIO_PROJECTS.splice(idx, 1);
      return true;
    }

    const { error } = await supabase
      .from('portfolio_projects')
      .delete()
      .eq('id', id);

    if (error) console.error('[portfolioRepository] deleteProject error:', error);
    return !error;
  },

  // ── Metrics CRUD ──────────────────────────────────────────────────────────

  async upsertMetrics(projectId: string, metrics: Partial<PortfolioMetric>[]): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    // Delete existing then re-insert
    await supabase.from('portfolio_metrics').delete().eq('project_id', projectId);

    if (metrics.length === 0) return true;

    const { error } = await supabase.from('portfolio_metrics').insert(
      metrics.map((m, idx) => ({
        project_id: projectId,
        metric_type: m.metric_type ?? '',
        display_prefix: m.display_prefix,
        value: m.value ?? 0,
        suffix: m.suffix,
        label: m.label ?? '',
        sort_order: m.sort_order ?? idx,
      }))
    );

    return !error;
  },

  // ── Links CRUD ────────────────────────────────────────────────────────────

  async upsertLinks(projectId: string, links: Partial<PortfolioLink>[]): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    await supabase.from('portfolio_project_links').delete().eq('project_id', projectId);

    if (links.length === 0) return true;

    const { error } = await supabase.from('portfolio_project_links').insert(
      links.map((l, idx) => ({
        project_id: projectId,
        link_type: l.link_type ?? 'OTHER',
        url: l.url ?? '',
        label: l.label,
        display_order: l.display_order ?? idx,
      }))
    );

    return !error;
  },

  // ── Categories CRUD ───────────────────────────────────────────────────────

  async updateProjectCategories(projectId: string, categoryIds: string[]): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    await supabase.from('portfolio_project_categories').delete().eq('project_id', projectId);

    if (categoryIds.length === 0) return true;

    const { error } = await supabase.from('portfolio_project_categories').insert(
      categoryIds.map(cid => ({ project_id: projectId, category_id: cid }))
    );

    return !error;
  },

  // ── Media / Storage ───────────────────────────────────────────────────────

  /**
   * Upload a file to the 'portfolio' storage bucket.
   */
  async uploadMedia(file: File, path?: string): Promise<string | null> {
    if (!isSupabaseConfigured) return null;

    const filePath = path ?? `projects/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from('portfolio')
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error('[portfolioRepository] uploadMedia error:', error.message);
      return null;
    }

    return filePath;
  },

  /**
   * Get a public URL for a storage path.
   */
  getPublicImageUrl,
};

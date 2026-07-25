import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  Project,
  PortfolioCategory,
  PortfolioMetric,
  PortfolioMedia,
  PortfolioLink,
  ProjectStatus,
} from '../domain/project/project.types';
import type { PortfolioPublicationDTO, ContributorSummaryDTO } from '../domain/craftsman/craftsman.types';
import { PORTFOLIO_PROJECTS } from '../content/portfolioProjects';
import { TEAM_MEMBERS } from '../mocks/team';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPublicImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  if (!isSupabaseConfigured) return '';
  const { data } = supabase.storage.from('portfolio').getPublicUrl(path);
  return data?.publicUrl ?? '';
}

/**
 * Map raw database row into legacy Project domain type.
 */
function mapRowToProject(row: any): Project {
  const categories: PortfolioCategory[] = (row.portfolio_project_categories ?? [])
    .map((jpc: any) => jpc.portfolio_categories)
    .filter(Boolean);

  const metrics: PortfolioMetric[] = (row.portfolio_metrics ?? [])
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const media: PortfolioMedia[] = (row.portfolio_media ?? [])
    .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));

  const links: PortfolioLink[] = (row.portfolio_project_links ?? [])
    .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));

  const primaryCategory = categories[0];
  const primaryLink = links.find((l) => l.link_type === 'LIVE_WEBSITE');

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? undefined,
    cover_image_path: row.cover_image_path ?? undefined,
    status: row.status ?? 'DRAFT',
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
    categories,
    metrics,
    media,
    links,

    images: {
      cover: getPublicImageUrl(row.cover_image_path) || (row.cover_image_path?.startsWith('/') ? row.cover_image_path : ''),
      gallery: media
        .filter((m) => m.media_type === 'IMAGE')
        .map((m) => getPublicImageUrl(m.path)),
    },
    featured: row.featured_rank != null,
    industry: primaryCategory?.name ?? '',
    url: primaryLink?.url ?? undefined,
  };
}

/**
 * Map raw database row into PortfolioPublicationDTO.
 */
function mapRowToDTO(row: any): PortfolioPublicationDTO {
  const categories: PortfolioCategory[] = (row.portfolio_project_categories ?? [])
    .map((jpc: any) => jpc.portfolio_categories)
    .filter(Boolean);

  const metrics: PortfolioMetric[] = (row.portfolio_metrics ?? [])
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const media: PortfolioMedia[] = (row.portfolio_media ?? [])
    .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));

  const links: PortfolioLink[] = (row.portfolio_project_links ?? [])
    .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));

  let project_lead: ContributorSummaryDTO | undefined;
  if (row.project_lead) {
    project_lead = {
      craftsman_id: row.project_lead.id,
      craftsman_slug: row.project_lead.slug,
      full_name: row.project_lead.full_name,
      avatar_url: row.project_lead.avatar_url,
      headline_title: row.project_lead.headline_title,
      role_name: 'Project Lead',
      role_slug: 'project-lead',
      is_lead: true,
    };
  }

  const contributors: ContributorSummaryDTO[] = (row.project_assignments ?? [])
    .filter((a: any) => a.visibility === 'PUBLIC' || a.visibility === undefined)
    .map((a: any) => {
      const craftsman = a.craftsman_profiles;
      const role = a.contribution_roles;
      return {
        craftsman_id: craftsman?.id ?? '',
        craftsman_slug: craftsman?.slug ?? '',
        full_name: craftsman?.full_name ?? 'Studio Member',
        avatar_url: craftsman?.avatar_url,
        headline_title: craftsman?.headline_title ?? '',
        role_name: role?.name ?? 'Contributor',
        role_slug: role?.slug ?? 'contributor',
        role_category: role?.category,
        contribution_summary: a.contribution_summary,
        is_lead: false,
      };
    });

  if (contributors.length === 0) {
    TEAM_MEMBERS.slice(0, 3).forEach((m, idx) => {
      contributors.push({
        craftsman_id: m.id,
        craftsman_slug: m.name.toLowerCase().replace(/\s+/g, '-'),
        full_name: m.name,
        avatar_url: m.image,
        headline_title: m.role,
        role_name: idx === 0 ? 'Creative Direction' : idx === 1 ? 'Systems Architecture' : 'Motion UI',
        role_slug: 'role-mock',
        is_lead: idx === 0,
      });
    });
  }

  const primaryCategory = categories[0];
  const primaryLink = links.find((l) => l.link_type === 'LIVE_WEBSITE');

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? undefined,
    cover_image_path: row.cover_image_path ?? undefined,
    status: row.status ?? 'PUBLISHED',
    publication_stage: row.publication_stage ?? (row.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'),
    featured_rank: row.featured_rank ?? undefined,
    featured: row.featured_rank != null,
    display_order: row.display_order ?? 0,
    technology_stack: row.technology_stack ?? [],
    services: row.services ?? [],
    overview: row.overview ?? undefined,
    challenge: row.challenge ?? undefined,
    solution: row.solution ?? undefined,
    seo_title: row.seo_title ?? undefined,
    meta_description: row.meta_description ?? undefined,
    canonical_url: row.canonical_url ?? undefined,
    created_at: row.created_at,

    project_lead,
    contributors,
    metrics,
    categories,
    links: links.map(l => ({
      id: l.id,
      project_id: l.project_id,
      link_type: l.link_type,
      url: l.url,
      label: l.label ?? undefined,
      display_order: l.display_order,
    })),
    media: media.map(m => ({
      id: m.id,
      project_id: m.project_id,
      path: m.path,
      media_type: m.media_type,
      alt_text: m.alt_text ?? undefined,
      caption: m.caption ?? undefined,
      display_order: m.display_order,
    })),
    images: {
      cover: getPublicImageUrl(row.cover_image_path) || (row.cover_image_path?.startsWith('/') ? row.cover_image_path : ''),
      gallery: media.filter((m) => m.media_type === 'IMAGE').map((m) => getPublicImageUrl(m.path)),
    },
    industry: primaryCategory?.name ?? '',
    url: primaryLink?.url ?? undefined,
  };
}

const PROJECT_SELECT = `
  *,
  portfolio_project_categories (
    portfolio_categories (*)
  ),
  portfolio_metrics (*),
  portfolio_media (*),
  portfolio_project_links (*)
`;

const PUBLICATION_SELECT = `
  *,
  portfolio_project_categories (
    portfolio_categories (*)
  ),
  portfolio_metrics (*),
  portfolio_media (*),
  portfolio_project_links (*),
  project_lead:craftsman_profiles (*),
  project_assignments (
    contribution_summary,
    visibility,
    craftsman_profiles (*),
    contribution_roles (*)
  )
`;

export const portfolioRepository = {
  // ── Read Queries ──────────────────────────────────────────────────────────

  async getAllProjects(): Promise<Project[]> {
    if (!isSupabaseConfigured) {
      return PORTFOLIO_PROJECTS as unknown as Project[];
    }

    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select(PROJECT_SELECT)
        .order('display_order', { ascending: true });

      if (error || !data) {
        return PORTFOLIO_PROJECTS as unknown as Project[];
      }

      return data.map(mapRowToProject);
    } catch {
      return PORTFOLIO_PROJECTS as unknown as Project[];
    }
  },

  async getPublishedProjects(): Promise<PortfolioPublicationDTO[]> {
    if (!isSupabaseConfigured) {
      return PORTFOLIO_PROJECTS.map((p) => mapRowToDTO({ ...p, status: 'PUBLISHED' }));
    }

    try {
      let { data, error } = await supabase
        .from('portfolio_publications')
        .select(PUBLICATION_SELECT)
        .eq('publication_stage', 'PUBLISHED')
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        const legacyRes = await supabase
          .from('portfolio_projects')
          .select(PUBLICATION_SELECT)
          .eq('status', 'PUBLISHED')
          .order('display_order', { ascending: true });
        data = legacyRes.data;
      }

      if (!data || data.length === 0) {
        return PORTFOLIO_PROJECTS.map((p) => mapRowToDTO({ ...p, status: 'PUBLISHED' }));
      }

      return data.map(mapRowToDTO);
    } catch {
      return PORTFOLIO_PROJECTS.map((p) => mapRowToDTO({ ...p, status: 'PUBLISHED' }));
    }
  },

  async getProjectBySlug(slug: string): Promise<PortfolioPublicationDTO | null> {
    if (!isSupabaseConfigured) {
      const mock = PORTFOLIO_PROJECTS.find((p) => p.slug === slug);
      return mock ? mapRowToDTO({ ...mock, status: 'PUBLISHED' }) : null;
    }

    try {
      let { data, error } = await supabase
        .from('portfolio_publications')
        .select(PUBLICATION_SELECT)
        .eq('slug', slug)
        .single();

      if (error || !data) {
        const legacyRes = await supabase
          .from('portfolio_projects')
          .select(PUBLICATION_SELECT)
          .eq('slug', slug)
          .single();
        data = legacyRes.data;
      }

      if (!data) {
        const mock = PORTFOLIO_PROJECTS.find((p) => p.slug === slug);
        return mock ? mapRowToDTO({ ...mock, status: 'PUBLISHED' }) : null;
      }

      return mapRowToDTO(data);
    } catch {
      const mock = PORTFOLIO_PROJECTS.find((p) => p.slug === slug);
      return mock ? mapRowToDTO({ ...mock, status: 'PUBLISHED' }) : null;
    }
  },

  async getCategories(): Promise<PortfolioCategory[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data } = await supabase
        .from('portfolio_categories')
        .select('*')
        .order('display_order', { ascending: true });

      return (data || []) as PortfolioCategory[];
    } catch {
      return [];
    }
  },

  // ── Write / Mutation Methods (Admin CMS) ──────────────────────────────────

  async createProject(projectData: Partial<Project>): Promise<Project | null> {
    if (!isSupabaseConfigured) return null;

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

    if (error || !data) return null;
    return mapRowToProject(data);
  },

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project | null> {
    if (!isSupabaseConfigured) return null;

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

    if (error || !data) return null;
    return mapRowToProject(data);
  },

  async updateStatus(id: string, status: ProjectStatus): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { error } = await supabase
      .from('portfolio_projects')
      .update({ status })
      .eq('id', id);

    return !error;
  },

  async cloneProject(id: string): Promise<Project | null> {
    if (!isSupabaseConfigured) return null;

    const { data: source, error: fetchErr } = await supabase
      .from('portfolio_projects')
      .select(PROJECT_SELECT)
      .eq('id', id)
      .single();

    if (fetchErr || !source) return null;

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

    if (insertErr || !cloned) return null;

    return this.getAllProjects().then(projs => projs.find(p => p.id === cloned.id) || null);
  },

  async deleteProject(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    const { error } = await supabase
      .from('portfolio_projects')
      .delete()
      .eq('id', id);

    return !error;
  },

  async upsertMetrics(projectId: string, metrics: Partial<PortfolioMetric>[]): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

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

  async updateProjectCategories(projectId: string, categoryIds: string[]): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    await supabase.from('portfolio_project_categories').delete().eq('project_id', projectId);

    if (categoryIds.length === 0) return true;

    const { error } = await supabase.from('portfolio_project_categories').insert(
      categoryIds.map(cid => ({ project_id: projectId, category_id: cid }))
    );

    return !error;
  },

  async uploadMedia(file: File, path?: string): Promise<string | null> {
    if (!isSupabaseConfigured) return null;

    const filePath = path ?? `projects/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from('portfolio')
      .upload(filePath, file, { upsert: true });

    if (error) return null;
    return filePath;
  },

  getPublicImageUrl,
};

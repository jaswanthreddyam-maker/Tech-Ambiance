import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  PortfolioCategory,
  PortfolioMetric,
  PortfolioMedia,
  PortfolioLink,
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
 * Map raw database row (from portfolio_publications or legacy portfolio_projects) into PortfolioPublicationDTO.
 */
function mapRowToDTO(row: any): PortfolioPublicationDTO {
  const categories: PortfolioCategory[] = (row.portfolio_project_categories ?? []).map((jpc: any) => jpc.portfolio_categories).filter(Boolean);
  const metrics: PortfolioMetric[] = (row.portfolio_metrics ?? []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const media: PortfolioMedia[] = (row.portfolio_media ?? []).sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));
  const links: PortfolioLink[] = (row.portfolio_project_links ?? []).sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));

  // Map project lead if present
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

  // Map project contributors
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

  // Fallback mock contributors if empty
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
  const primaryLink = links.find(l => l.link_type === 'LIVE_WEBSITE');

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
    links,
    media,
    images: {
      cover: getPublicImageUrl(row.cover_image_path) || (row.cover_image_path?.startsWith('/') ? row.cover_image_path : ''),
      gallery: media.filter(m => m.media_type === 'IMAGE').map(m => getPublicImageUrl(m.path)),
    },
    industry: primaryCategory?.name ?? '',
    url: primaryLink?.url ?? undefined,
  };
}

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

  async getPublishedProjects(): Promise<PortfolioPublicationDTO[]> {
    if (!isSupabaseConfigured) {
      return PORTFOLIO_PROJECTS.map(p => mapRowToDTO({ ...p, status: 'PUBLISHED' }));
    }

    try {
      // First try querying portfolio_publications table
      let { data, error } = await supabase
        .from('portfolio_publications')
        .select(PUBLICATION_SELECT)
        .eq('publication_stage', 'PUBLISHED')
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        // Fallback query to legacy portfolio_projects if publications not populated yet
        const legacyRes = await supabase
          .from('portfolio_projects')
          .select(PUBLICATION_SELECT)
          .eq('status', 'PUBLISHED')
          .order('display_order', { ascending: true });
        data = legacyRes.data;
      }

      if (!data || data.length === 0) {
        return PORTFOLIO_PROJECTS.map(p => mapRowToDTO({ ...p, status: 'PUBLISHED' }));
      }

      return data.map(mapRowToDTO);
    } catch {
      return PORTFOLIO_PROJECTS.map(p => mapRowToDTO({ ...p, status: 'PUBLISHED' }));
    }
  },

  async getProjectBySlug(slug: string): Promise<PortfolioPublicationDTO | null> {
    if (!isSupabaseConfigured) {
      const mock = PORTFOLIO_PROJECTS.find(p => p.slug === slug);
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
        const mock = PORTFOLIO_PROJECTS.find(p => p.slug === slug);
        return mock ? mapRowToDTO({ ...mock, status: 'PUBLISHED' }) : null;
      }

      return mapRowToDTO(data);
    } catch {
      const mock = PORTFOLIO_PROJECTS.find(p => p.slug === slug);
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

  getPublicImageUrl,
};

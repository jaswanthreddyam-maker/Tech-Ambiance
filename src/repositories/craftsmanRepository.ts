import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TEAM_MEMBERS } from '../mocks/team';
import { PORTFOLIO_PROJECTS } from '../content/portfolioProjects';
import type {
  CraftsmanSummaryDTO,
  CraftsmanProfileDetailDTO,
  ContributedProjectSummaryDTO,
} from '../domain/craftsman/craftsman.types';

/**
 * Generate fallback DTO for mock team members when offline or Supabase is unconfigured.
 */
function mapMockToProfileDetail(memberId: string): CraftsmanProfileDetailDTO | null {
  const member = TEAM_MEMBERS.find(m => m.id === memberId || m.name.toLowerCase().includes(memberId.toLowerCase()));
  if (!member) return null;

  const slug = member.name.toLowerCase().replace(/\s+/g, '-');

  // Map mock contributed projects
  const contributed_projects: ContributedProjectSummaryDTO[] = PORTFOLIO_PROJECTS.map((proj, idx) => ({
    publication_id: proj.id,
    title: proj.title,
    slug: proj.slug,
    cover_image_path: proj.cover_image_path,
    cover_url: proj.images?.cover || (proj.cover_image_path?.startsWith('/') ? proj.cover_image_path : ''),
    role_name: idx % 2 === 0 ? member.role : 'Core Systems Architecture',
    role_slug: 'lead-contribution',
    contribution_summary: member.responsibility,
    services: proj.services || [],
  }));

  return {
    id: member.id,
    slug,
    full_name: member.name,
    headline_title: member.role,
    biography: member.bio,
    philosophy_quote: "Precision engineering, calm motion, zero layout shift.",
    avatar_url: member.image,
    member_type: 'FOUNDER',
    expertise_tags: member.skills,
    social_links: member.socials || {},
    display_order: parseInt(member.number, 10) || 1,
    current_focus: member.responsibility,
    contributed_projects,
  };
}

export const craftsmanRepository = {
  /**
   * Get all active studio craftsmen.
   */
  async getAllCraftsmen(): Promise<CraftsmanSummaryDTO[]> {
    if (!isSupabaseConfigured) {
      return TEAM_MEMBERS.map(m => ({
        id: m.id,
        slug: m.name.toLowerCase().replace(/\s+/g, '-'),
        full_name: m.name,
        headline_title: m.role,
        biography: m.bio,
        avatar_url: m.image,
        member_type: 'FOUNDER',
        expertise_tags: m.skills,
        display_order: parseInt(m.number, 10) || 1,
      }));
    }

    try {
      const { data, error } = await supabase
        .from('craftsman_profiles')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return TEAM_MEMBERS.map(m => ({
          id: m.id,
          slug: m.name.toLowerCase().replace(/\s+/g, '-'),
          full_name: m.name,
          headline_title: m.role,
          biography: m.bio,
          avatar_url: m.image,
          member_type: 'FOUNDER',
          expertise_tags: m.skills,
          display_order: parseInt(m.number, 10) || 1,
        }));
      }

      return data as CraftsmanSummaryDTO[];
    } catch {
      return TEAM_MEMBERS.map(m => ({
        id: m.id,
        slug: m.name.toLowerCase().replace(/\s+/g, '-'),
        full_name: m.name,
        headline_title: m.role,
        biography: m.bio,
        avatar_url: m.image,
        member_type: 'FOUNDER',
        expertise_tags: m.skills,
        display_order: parseInt(m.number, 10) || 1,
      }));
    }
  },

  /**
   * Get craftsman profile detail by slug with contributed projects.
   */
  async getCraftsmanBySlug(slug: string): Promise<CraftsmanProfileDetailDTO | null> {
    if (!isSupabaseConfigured) {
      return mapMockToProfileDetail(slug);
    }

    try {
      // 1. Fetch craftsman profile
      const { data: profile, error } = await supabase
        .from('craftsman_profiles')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !profile) {
        return mapMockToProfileDetail(slug);
      }

      // 2. Fetch project assignments with public visibility
      const { data: assignments } = await supabase
        .from('project_assignments')
        .select(`
          contribution_summary,
          visibility,
          contribution_roles ( name, slug ),
          portfolio_publications ( id, title, slug, cover_image_path, services )
        `)
        .eq('craftsman_id', profile.id)
        .eq('visibility', 'PUBLIC');

      const contributed_projects: ContributedProjectSummaryDTO[] = (assignments || []).map((a: any) => {
        const pub = a.portfolio_publications;
        const role = a.contribution_roles;
        const cover_url = pub?.cover_image_path
          ? pub.cover_image_path.startsWith('http') || pub.cover_image_path.startsWith('/')
            ? pub.cover_image_path
            : supabase.storage.from('portfolio').getPublicUrl(pub.cover_image_path).data.publicUrl
          : '';

        return {
          publication_id: pub?.id || '',
          title: pub?.title || 'Untitled Flagship',
          slug: pub?.slug || '',
          cover_image_path: pub?.cover_image_path,
          cover_url,
          role_name: role?.name || 'Contributor',
          role_slug: role?.slug || 'contributor',
          contribution_summary: a.contribution_summary,
          services: pub?.services || [],
        };
      });

      return {
        id: profile.id,
        slug: profile.slug,
        full_name: profile.full_name,
        headline_title: profile.headline_title,
        biography: profile.biography,
        philosophy_quote: profile.philosophy_quote || "Craftsmanship is attention to details that matter.",
        avatar_url: profile.avatar_url,
        member_type: profile.member_type || 'FOUNDER',
        expertise_tags: profile.expertise_tags || [],
        social_links: profile.social_links || {},
        display_order: profile.display_order || 0,
        current_focus: profile.headline_title,
        contributed_projects,
      };
    } catch {
      return mapMockToProfileDetail(slug);
    }
  },
};

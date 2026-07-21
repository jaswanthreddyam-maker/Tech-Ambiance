import type { DeliverableFile } from '../../../types/studioHQ';
import type { PortalDocument } from '../types/portalModels';

export function mapDocumentToPortal(row: DeliverableFile): PortalDocument {
  return {
    id: row.id,
    fileName: row.file_name,
    category: row.category || 'Deliverables',
    versionTag: row.version_tag || 'v1',
    fileType: row.file_type,
    fileSize: row.file_size,
    uploadedBy: row.uploaded_by,
    uploadedAt: row.created_at,
    storagePath: row.storage_path,
  };
}

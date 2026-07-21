import * as THREE from 'three';
import { EventBus } from './EventBus';

export class AssetEngine {
  private eventBus: EventBus;
  private trackedGeometries: Set<THREE.BufferGeometry> = new Set();
  private trackedMaterials: Set<THREE.Material> = new Set();
  private trackedTextures: Set<THREE.Texture> = new Set();

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  public registerGeometry<T extends THREE.BufferGeometry>(geometry: T): T {
    this.trackedGeometries.add(geometry);
    return geometry;
  }

  public registerMaterial<T extends THREE.Material>(material: T): T {
    this.trackedMaterials.add(material);
    return material;
  }

  public registerTexture<T extends THREE.Texture>(texture: T): T {
    this.trackedTextures.add(texture);
    return texture;
  }

  public disposeAll(): void {
    this.trackedGeometries.forEach(geo => {
      try {
        geo.dispose();
      } catch (e) {
        console.error('[AssetEngine] Geometry dispose error:', e);
      }
    });
    this.trackedGeometries.clear();

    this.trackedMaterials.forEach(mat => {
      try {
        mat.dispose();
      } catch (e) {
        console.error('[AssetEngine] Material dispose error:', e);
      }
    });
    this.trackedMaterials.clear();

    this.trackedTextures.forEach(tex => {
      try {
        tex.dispose();
      } catch (e) {
        console.error('[AssetEngine] Texture dispose error:', e);
      }
    });
    this.trackedTextures.clear();

    this.eventBus.emit('asset.disposed', { assetId: 'all' });
  }

  public destroy(): void {
    this.disposeAll();
  }
}

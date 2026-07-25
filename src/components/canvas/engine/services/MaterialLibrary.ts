import * as THREE from 'three';
import { AssetManager } from './AssetManager';

export class MaterialLibrary {
  private static instance: MaterialLibrary | null = null;
  private materials: Map<string, THREE.Material> = new Map();

  public static getInstance(): MaterialLibrary {
    if (!MaterialLibrary.instance) {
      MaterialLibrary.instance = new MaterialLibrary();
    }
    return MaterialLibrary.instance;
  }

  public getObsidianMaterial(): THREE.MeshStandardMaterial {
    const key = 'obsidian';
    if (this.materials.has(key)) {
      return this.materials.get(key) as THREE.MeshStandardMaterial;
    }

    const assetMgr = AssetManager.getInstance();
    const texture = assetMgr.getProceduralMarbleTexture('obsidian-noise');

    const mat = new THREE.MeshStandardMaterial({
      color: 0x070b09,
      roughness: 0.22,
      metalness: 0.75,
      map: texture,
      roughnessMap: texture,
    });

    this.materials.set(key, mat);
    return mat;
  }

  public getBlackMarbleMaterial(): THREE.MeshStandardMaterial {
    const key = 'black-marble';
    if (this.materials.has(key)) {
      return this.materials.get(key) as THREE.MeshStandardMaterial;
    }

    const assetMgr = AssetManager.getInstance();
    const texture = assetMgr.getProceduralMarbleTexture('black-marble');
    const envMap = assetMgr.getProceduralStudioEnvMap();

    const mat = new THREE.MeshStandardMaterial({
      color: 0x080d0a,
      roughness: 0.18,
      metalness: 0.85,
      map: texture,
      envMap: envMap,
      envMapIntensity: 0.6,
    });

    this.materials.set(key, mat);
    return mat;
  }

  public getBlackChromeMaterial(): THREE.MeshStandardMaterial {
    const key = 'black-chrome';
    if (this.materials.has(key)) {
      return this.materials.get(key) as THREE.MeshStandardMaterial;
    }

    const assetMgr = AssetManager.getInstance();
    const envMap = assetMgr.getProceduralStudioEnvMap();

    const mat = new THREE.MeshStandardMaterial({
      color: 0x111613,
      roughness: 0.08,
      metalness: 0.95,
      envMap: envMap,
      envMapIntensity: 1.2,
    });

    this.materials.set(key, mat);
    return mat;
  }

  public getGoldMaterial(): THREE.MeshStandardMaterial {
    const key = 'gold';
    if (this.materials.has(key)) {
      return this.materials.get(key) as THREE.MeshStandardMaterial;
    }

    const assetMgr = AssetManager.getInstance();
    const envMap = assetMgr.getProceduralStudioEnvMap();

    const mat = new THREE.MeshStandardMaterial({
      color: 0xc5a572,
      roughness: 0.25,
      metalness: 0.9,
      envMap: envMap,
      envMapIntensity: 0.9,
    });

    this.materials.set(key, mat);
    return mat;
  }

  public getGlassStoneMaterial(): THREE.MeshPhysicalMaterial {
    const key = 'glass-stone';
    if (this.materials.has(key)) {
      return this.materials.get(key) as THREE.MeshPhysicalMaterial;
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x06291e,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85,
      ior: 1.5,
      reflectivity: 0.9,
    });

    this.materials.set(key, mat);
    return mat;
  }

  public dispose(): void {
    this.materials.forEach(m => m.dispose());
    this.materials.clear();
  }
}

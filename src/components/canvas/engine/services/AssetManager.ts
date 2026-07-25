import * as THREE from 'three';

export class AssetManager {
  private static instance: AssetManager | null = null;
  private textureCache: Map<string, THREE.Texture> = new Map();
  private geometryCache: Map<string, THREE.BufferGeometry> = new Map();

  public static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  /**
   * Generates a procedural noise/marble texture for stone and obsidian surfaces.
   */
  public getProceduralMarbleTexture(name: string = 'black-marble'): THREE.Texture {
    if (this.textureCache.has(name)) {
      return this.textureCache.get(name)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Base obsidian black
      ctx.fillStyle = '#060a08';
      ctx.fillRect(0, 0, 512, 512);

      // Fine golden marble veins
      ctx.strokeStyle = '#c5a572';
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.18;

      for (let i = 0; i < 18; i++) {
        ctx.beginPath();
        let x = Math.random() * 512;
        let y = 0;
        ctx.moveTo(x, y);

        while (y < 512) {
          x += (Math.random() - 0.5) * 45;
          y += Math.random() * 30 + 10;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Micro specular noise dots
      ctx.fillStyle = '#e0c896';
      ctx.globalAlpha = 0.12;
      for (let i = 0; i < 400; i++) {
        const nx = Math.random() * 512;
        const ny = Math.random() * 512;
        ctx.fillRect(nx, ny, 1.5, 1.5);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;

    this.textureCache.set(name, texture);
    return texture;
  }

  /**
   * Generates a procedural environmental reflection map for studio lighting.
   */
  public getProceduralStudioEnvMap(): THREE.Texture {
    const key = 'studio-env-map';
    if (this.textureCache.has(key)) {
      return this.textureCache.get(key)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 256, 128);
      grad.addColorStop(0, '#06291e');
      grad.addColorStop(0.5, '#121a16');
      grad.addColorStop(0.8, '#c5a572');
      grad.addColorStop(1, '#060a08');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 128);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.needsUpdate = true;

    this.textureCache.set(key, texture);
    return texture;
  }

  public registerGeometry(id: string, geometry: THREE.BufferGeometry): void {
    this.geometryCache.set(id, geometry);
  }

  public getGeometry(id: string): THREE.BufferGeometry | undefined {
    return this.geometryCache.get(id);
  }

  public dispose(): void {
    this.textureCache.forEach(t => t.dispose());
    this.geometryCache.forEach(g => g.dispose());
    this.textureCache.clear();
    this.geometryCache.clear();
  }
}

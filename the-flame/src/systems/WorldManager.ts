import { WORLD, WorldRegion } from '../data/worldData';
import { MatterRegistry } from './MatterRegistry';

export class WorldManager {
  private densityByRegion = new Map<string, number>();

  constructor(private matter: MatterRegistry){
    for(const region of WORLD.regions){
      const [min, max] = region.densityRange;
      this.densityByRegion.set(region.id, min + Math.random() * (max - min));
    }
  }

  regionAt(x: number, y: number): WorldRegion | undefined {
    return WORLD.regions.find(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
  }

  // hpMultiplier is Phase 11's world-escalation knob (see endgameData.ts) --
  // defaults to 1 so the initial call from FlameScene.create() behaves
  // exactly as it did before Phase 11 introduced escalating worlds.
  populate(hpMultiplier = 1){
    for(const region of WORLD.regions){
      const density = this.densityByRegion.get(region.id) ?? 1;
      const count = Math.round(region.baseFuelCount * density);
      for(let i = 0; i < count; i++){
        this.matter.spawnFuel(
          { x: region.x, y: region.y, w: region.w, h: region.h },
          region.tierWeights,
          hpMultiplier
        );
      }
    }
  }

  // Called once the world is fully consumed (see FlameScene.checkWorldConsumed).
  // Re-rolls per-region density exactly like the constructor did, then wipes
  // and repopulates matter. Safe to clear fuels wholesale: every burned fuel
  // already had its visuals destroyed in MatterRegistry.finishBurn, and a
  // fully-consumed world has none left alive.
  regenerate(hpMultiplier = 1){
    for(const region of WORLD.regions){
      const [min, max] = region.densityRange;
      this.densityByRegion.set(region.id, min + Math.random() * (max - min));
    }
    this.matter.fuels = [];
    this.populate(hpMultiplier);
  }
}

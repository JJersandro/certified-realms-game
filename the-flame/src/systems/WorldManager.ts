import { WORLD } from '../data/worldData';
import { MatterRegistry } from './MatterRegistry';

export class WorldManager {
  private densityByRegion = new Map<string, number>();

  constructor(private matter: MatterRegistry){
    this.rollDensities();
  }

  private rollDensities(){
    for(const region of WORLD.regions){
      const [min, max] = region.densityRange;
      this.densityByRegion.set(region.id, min + Math.random() * (max - min));
    }
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
  //
  // Also clears accumulated scorch marks (see MatterRegistry.clearScorches):
  // this.matter.fuels is replaced wholesale here, not appended to, so a fresh
  // world's *fuel* count never compounds across clears -- but scorches are a
  // separate array on the host that regenerate() previously never touched, so
  // a long session that clears several escalating worlds kept accumulating
  // every prior world's burn marks forever. A regenerated world is also
  // narratively a new landscape, so it shouldn't still show the last world's
  // burns.
  regenerate(hpMultiplier = 1){
    this.rollDensities();
    this.matter.fuels = [];
    this.matter.clearScorches();
    this.populate(hpMultiplier);
  }
}

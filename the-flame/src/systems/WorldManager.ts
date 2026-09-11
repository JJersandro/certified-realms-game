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

  populate(){
    for(const region of WORLD.regions){
      const density = this.densityByRegion.get(region.id) ?? 1;
      const count = Math.round(region.baseFuelCount * density);
      for(let i = 0; i < count; i++){
        this.matter.spawnFuel(
          { x: region.x, y: region.y, w: region.w, h: region.h },
          region.tierWeights
        );
      }
    }
  }
}

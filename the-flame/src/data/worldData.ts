export type WorldRegion = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  // weights line up positionally with MATTER's tier order (matterData.ts) --
  // a region-local override of MATTER's own spawnWeight column.
  tierWeights: readonly number[];
  baseFuelCount: number;
  // rolled once per playthrough into an actual multiplier -- same region
  // layout, different density each time you play.
  densityRange: readonly [number, number];
};

export const WORLD = {
  width: 4000,
  height: 3000,
  // baseFuelCount bumped ~50% across every region -- the previous density
  // (~150-250 fuel across the full 4000x3000 world) meant a natural,
  // undirected sweep frequently found nothing reachable for a long stretch.
  regions: [
    {
      id: 'ember-fields',
      x: 0, y: 0, w: 2000, h: 1500,
      tierWeights: [40, 30, 20, 8, 2, 0, 0],
      baseFuelCount: 90,
      densityRange: [0.7, 1.0]
    },
    {
      id: 'deep-woods',
      x: 2000, y: 0, w: 2000, h: 1500,
      tierWeights: [20, 35, 30, 10, 5, 0, 0],
      baseFuelCount: 95,
      densityRange: [0.8, 1.1]
    },
    {
      id: 'ashen-quarry',
      x: 0, y: 1500, w: 2000, h: 1500,
      tierWeights: [10, 15, 25, 25, 15, 8, 2],
      baseFuelCount: 80,
      densityRange: [0.6, 0.9]
    },
    {
      id: 'the-forge',
      x: 2000, y: 1500, w: 2000, h: 1500,
      tierWeights: [5, 10, 15, 20, 25, 15, 10],
      baseFuelCount: 65,
      densityRange: [0.5, 0.8]
    }
  ] as const satisfies readonly WorldRegion[]
} as const;

// Sprite definitions for the pixel art game
export const SPRITES = {
  PLAYER: {
    width: 16,
    height: 16,
    color: '#4a90e2',
    outlineColor: '#2c5985'
  },
  
  BUILDINGS: {
    MANSION: {
      baseColor: '#DAA520',
      roofColor: '#B8860B',
      name: "Mayor's Mansion"
    },
    WORKSHOP: {
      baseColor: '#CD853F',
      roofColor: '#A0522D',
      name: 'Toolsmith Workshop'
    },
    WASTE: {
      baseColor: '#FF6347',
      roofColor: '#DC143C',
      name: 'No-Organic Waste'
    },
    COMPOST: {
      baseColor: '#8B4513',
      roofColor: '#654321',
      name: 'Organic Compost'
    },
    FARM: {
      baseColor: '#F4A460',
      roofColor: '#DEB887',
      name: 'Farm Shop'
    }
  },
  
  ENVIRONMENT: {
    FOREST: '#2a5d31',
    FOREST_DARK: '#1e4a26',
    TREE: '#0f2812',
    RIVER: '#4a8cc7',
    RIVER_LIGHT: '#6ba3d9',
    PATH: '#d4a574'
  }
};

export const TILE_SIZE = 40;
export const MAP_WIDTH = 800;
export const MAP_HEIGHT = 600;

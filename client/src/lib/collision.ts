import { Building } from "./stores/useGameState";

export function checkBuildingCollision(
  playerX: number, 
  playerY: number, 
  building: Building
): boolean {
  const playerSize = 16; // Player sprite size
  const buffer = 5; // Small buffer around buildings
  
  return (
    playerX - playerSize/2 < building.x + building.width + buffer &&
    playerX + playerSize/2 > building.x - buffer &&
    playerY - playerSize/2 < building.y + building.height + buffer &&
    playerY + playerSize/2 > building.y - buffer
  );
}

export function checkBounds(x: number, y: number, mapWidth: number, mapHeight: number): boolean {
  const buffer = 25;
  return x >= buffer && x <= mapWidth - buffer && y >= buffer && y <= mapHeight - buffer;
}

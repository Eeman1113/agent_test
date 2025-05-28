import { Position, Building, Camera } from "./stores/useGameState";
import { checkBuildingCollision } from "./collision";

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.setupCanvas();
  }
  
  private setupCanvas() {
    // Set up pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
    this.canvas.style.imageRendering = 'pixelated';
  }
  
  checkCollision(playerX: number, playerY: number, buildings: Building[]): boolean {
    // Check bounds
    if (playerX < 25 || playerX > 775 || playerY < 25 || playerY > 575) {
      return false;
    }
    
    // Check building collisions
    for (const building of buildings) {
      if (checkBuildingCollision(playerX, playerY, building)) {
        return false;
      }
    }
    
    return true;
  }
  
  render(playerPosition: Position, camera: Camera, buildings: Building[]) {
    // Clear canvas
    this.ctx.fillStyle = '#2a5d31'; // Forest green background
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.save();
    
    // Apply camera transform
    this.ctx.translate(-camera.x, -camera.y);
    
    // Draw forest background pattern
    this.drawForestBackground();
    
    // Draw river
    this.drawRiver();
    
    // Draw paths
    this.drawPaths();
    
    // Draw buildings
    this.drawBuildings(buildings);
    
    // Draw player
    this.drawPlayer(playerPosition);
    
    this.ctx.restore();
  }
  
  private drawForestBackground() {
    // Draw improved forest with varied textures
    this.ctx.fillStyle = '#2a5d31';
    this.ctx.fillRect(0, 0, 800, 600);
    
    // Draw forest border at top
    this.ctx.fillStyle = '#1a4520';
    this.ctx.fillRect(0, 0, 800, 120);
    
    // Add detailed tree sprites along the top
    for (let i = 0; i < 15; i++) {
      const x = 30 + (i * 50);
      const y = 20 + (i % 3) * 15;
      
      // Tree trunk
      this.ctx.fillStyle = '#654321';
      this.ctx.fillRect(x + 8, y + 25, 8, 20);
      
      // Tree canopy - layered circles for depth
      this.ctx.fillStyle = '#0f3d15';
      this.ctx.fillRect(x, y, 24, 24);
      this.ctx.fillStyle = '#1a5020';
      this.ctx.fillRect(x + 2, y + 2, 20, 20);
      this.ctx.fillStyle = '#2a6030';
      this.ctx.fillRect(x + 4, y + 4, 16, 16);
    }
    
    // Add scattered bushes and plants
    this.ctx.fillStyle = '#1a5020';
    for (let i = 0; i < 25; i++) {
      const x = (i * 31) % 780 + 10;
      const y = (i * 19) % 100 + 500;
      this.ctx.fillRect(x, y, 8, 6);
    }
  }
  
  private drawRiver() {
    // Draw enhanced river at bottom
    this.ctx.fillStyle = '#2E8B57';
    this.ctx.fillRect(0, 520, 800, 80);
    
    // River water with gradient effect
    this.ctx.fillStyle = '#4682B4';
    this.ctx.fillRect(0, 530, 800, 60);
    
    // Lighter water highlights
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 535, 800, 50);
    
    // Water flow animation pattern
    this.ctx.fillStyle = '#B0E0E6';
    for (let x = 0; x < 800; x += 15) {
      const wave1 = Math.sin(x * 0.05) * 3;
      const wave2 = Math.cos(x * 0.08) * 2;
      this.ctx.fillRect(x, 540 + wave1, 8, 2);
      this.ctx.fillRect(x + 7, 550 + wave2, 6, 2);
      this.ctx.fillRect(x + 3, 560 + wave1 * 0.5, 4, 1);
    }
    
    // Add wooden dock
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(380, 515, 40, 15);
    this.ctx.fillRect(385, 510, 30, 5);
    
    // Dock posts
    this.ctx.fillStyle = '#654321';
    this.ctx.fillRect(385, 515, 4, 20);
    this.ctx.fillRect(410, 515, 4, 20);
  }
  
  private drawPaths() {
    // Draw enhanced paths with better aesthetics
    this.ctx.fillStyle = '#C8860D';
    
    // Add path shadows first
    this.ctx.fillStyle = '#8B7355';
    this.ctx.fillRect(52, 282, 650, 40);
    this.ctx.fillRect(362, 182, 80, 340);
    this.ctx.fillRect(102, 202, 600, 30);
    this.ctx.fillRect(82, 452, 520, 30);
    this.ctx.fillRect(322, 242, 160, 120);
    
    // Main paths with golden sand color
    this.ctx.fillStyle = '#DEB887';
    
    // Main cross-shaped town square paths
    // Horizontal main path
    this.ctx.fillRect(50, 280, 650, 40);
    
    // Vertical main path
    this.ctx.fillRect(360, 180, 80, 340);
    
    // Upper horizontal connections
    this.ctx.fillRect(100, 200, 600, 30);
    
    // Lower horizontal connections  
    this.ctx.fillRect(80, 450, 520, 30);
    
    // Town square center
    this.ctx.fillRect(320, 240, 160, 120);
    
    // Add path details and texture
    this.ctx.fillStyle = '#F5DEB3';
    for (let x = 50; x < 700; x += 20) {
      for (let y = 280; y < 320; y += 10) {
        if ((x + y) % 40 === 0) {
          this.ctx.fillRect(x, y, 3, 3);
        }
      }
    }
    
    // Add cobblestone pattern to town square
    this.ctx.fillStyle = '#D2B48C';
    for (let x = 320; x < 480; x += 12) {
      for (let y = 240; y < 360; y += 12) {
        if ((x + y) % 24 === 0) {
          this.ctx.fillRect(x, y, 8, 8);
        }
      }
    }
  }
  
  private drawBuildings(buildings: Building[]) {
    buildings.forEach(building => {
      // Special rendering for different building types
      if (building.type === 'field') {
        // Draw field as a different pattern
        this.ctx.fillStyle = this.getBuildingColor(building.type);
        this.ctx.fillRect(building.x, building.y, building.width, building.height);
        
        // Add field pattern
        this.ctx.fillStyle = '#FFD700';
        for (let i = 0; i < building.width; i += 8) {
          for (let j = 0; j < building.height; j += 6) {
            this.ctx.fillRect(building.x + i, building.y + j, 4, 2);
          }
        }
        
        // Field outline
        this.ctx.strokeStyle = '#B8860B';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(building.x, building.y, building.width, building.height);
      } else if (building.type === 'monument') {
        // Draw town square monument
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(building.x + 2, building.y + 2, building.width, building.height);
        
        this.ctx.fillStyle = this.getBuildingColor(building.type);
        this.ctx.fillRect(building.x, building.y, building.width, building.height);
        
        // Monument details
        this.ctx.fillStyle = '#A9A9A9';
        this.ctx.fillRect(building.x + 10, building.y - 10, 20, 50);
        this.ctx.fillStyle = '#2F4F4F';
        this.ctx.fillRect(building.x + 15, building.y - 5, 10, 10);
        
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(building.x, building.y, building.width, building.height);
      } else if (building.type === 'preparation') {
        // Draw preparation area with tools
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(building.x + 2, building.y + 2, building.width, building.height);
        
        this.ctx.fillStyle = this.getBuildingColor(building.type);
        this.ctx.fillRect(building.x, building.y, building.width, building.height);
        
        // Add barrels and tools
        this.ctx.fillStyle = '#8B4513';
        for (let i = 0; i < 5; i++) {
          this.ctx.fillRect(building.x + 10 + (i * 20), building.y + 15, 8, 10);
        }
        
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(building.x, building.y, building.width, building.height);
      } else {
        // Regular building rendering
        // Building shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(building.x + 3, building.y + 3, building.width, building.height);
        
        // Building base
        this.ctx.fillStyle = this.getBuildingColor(building.type);
        this.ctx.fillRect(building.x, building.y, building.width, building.height);
        
        // Building outline
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(building.x, building.y, building.width, building.height);
        
        // Roof (not for fields or monuments)
        this.ctx.fillStyle = this.getRoofColor(building.type);
        this.ctx.fillRect(building.x - 5, building.y - 15, building.width + 10, 20);
        
        // Door
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(
          building.x + building.width / 2 - 8, 
          building.y + building.height - 20, 
          16, 
          20
        );
        
        // Windows
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(building.x + 10, building.y + 15, 12, 12);
        if (building.width > 50) {
          this.ctx.fillRect(building.x + building.width - 22, building.y + 15, 12, 12);
        }
      }
      
      // Building label for all types
      this.ctx.fillStyle = '#000';
      this.ctx.font = '9px Courier New';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        building.name, 
        building.x + building.width / 2, 
        building.y + building.height + 15
      );
    });
  }
  
  private getBuildingColor(type: string): string {
    switch (type) {
      case 'workshop': return '#CD853F';
      case 'clinic': return '#FFB6C1';
      case 'hall': return '#DAA520';
      case 'waste': return '#FF6347';
      case 'compost': return '#8B4513';
      case 'farm': return '#F4A460';
      case 'granary': return '#DEB887';
      case 'field': return '#FFA500';
      case 'preparation': return '#D2B48C';
      case 'monument': return '#696969';
      default: return '#D2B48C';
    }
  }
  
  private getRoofColor(type: string): string {
    switch (type) {
      case 'workshop': return '#A0522D';
      case 'clinic': return '#FF69B4';
      case 'hall': return '#B8860B';
      case 'waste': return '#DC143C';
      case 'compost': return '#654321';
      case 'farm': return '#CD853F';
      case 'granary': return '#BC9A6A';
      case 'field': return '#FF8C00';
      case 'preparation': return '#A0522D';
      case 'monument': return '#2F4F4F';
      default: return '#D2B48C';
    }
  }
  
  private drawPlayer(position: Position) {
    // Enhanced player sprite with more detail
    // Player shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.ctx.fillRect(position.x - 7, position.y + 3, 14, 5);
    
    // Player body (tunic)
    this.ctx.fillStyle = '#4a90e2';
    this.ctx.fillRect(position.x - 8, position.y - 4, 16, 12);
    
    // Player head
    this.ctx.fillStyle = '#FFE4B5';
    this.ctx.fillRect(position.x - 6, position.y - 12, 12, 8);
    
    // Hair
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(position.x - 6, position.y - 12, 12, 4);
    
    // Eyes
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(position.x - 4, position.y - 9, 2, 2);
    this.ctx.fillRect(position.x + 2, position.y - 9, 2, 2);
    
    // Simple smile
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(position.x - 2, position.y - 6, 4, 1);
    
    // Arms
    this.ctx.fillStyle = '#FFE4B5';
    this.ctx.fillRect(position.x - 10, position.y - 2, 4, 8);
    this.ctx.fillRect(position.x + 6, position.y - 2, 4, 8);
    
    // Legs
    this.ctx.fillStyle = '#654321';
    this.ctx.fillRect(position.x - 4, position.y + 8, 3, 6);
    this.ctx.fillRect(position.x + 1, position.y + 8, 3, 6);
    
    // Boots
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(position.x - 5, position.y + 12, 4, 3);
    this.ctx.fillRect(position.x + 1, position.y + 12, 4, 3);
    
    // Player outline
    this.ctx.strokeStyle = '#2c5985';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(position.x - 8, position.y - 12, 16, 20);
  }
}

/**
 * A* Pathfinding Algorithm for AI Agents
 * Allows agents to navigate around obstacles intelligently
 */

export interface PathNode {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic cost to goal
  f: number; // Total cost (g + h)
  parent: PathNode | null;
}

export interface GridCell {
  x: number;
  y: number;
  walkable: boolean;
  cost: number; // Movement cost (1 = normal, higher = harder to traverse)
}

export class Pathfinder {
  private grid: GridCell[][] = [];
  private gridWidth: number;
  private gridHeight: number;
  private cellSize: number;

  constructor(mapWidth: number, mapHeight: number, cellSize: number = 20) {
    this.cellSize = cellSize;
    this.gridWidth = Math.floor(mapWidth / cellSize);
    this.gridHeight = Math.floor(mapHeight / cellSize);
    this.initializeGrid();
  }

  private initializeGrid(): void {
    this.grid = [];
    for (let y = 0; y < this.gridHeight; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.gridWidth; x++) {
        this.grid[y][x] = {
          x,
          y,
          walkable: true,
          cost: 1
        };
      }
    }
  }

  /**
   * Update grid based on buildings and obstacles
   */
  updateObstacles(buildings: Array<{ x: number; y: number; width: number; height: number }>, 
                   rivers: Array<{ x: number; y: number; width: number; height: number }> = []): void {
    // Reset grid
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        this.grid[y][x].walkable = true;
        this.grid[y][x].cost = 1;
      }
    }

    // Mark buildings as non-walkable
    buildings.forEach(building => {
      const startX = Math.floor(building.x / this.cellSize);
      const startY = Math.floor(building.y / this.cellSize);
      const endX = Math.floor((building.x + building.width) / this.cellSize);
      const endY = Math.floor((building.y + building.height) / this.cellSize);

      for (let y = Math.max(0, startY); y <= Math.min(this.gridHeight - 1, endY); y++) {
        for (let x = Math.max(0, startX); x <= Math.min(this.gridWidth - 1, endX); x++) {
          this.grid[y][x].walkable = false;
        }
      }
    });

    // Mark rivers as high-cost areas (agents can cross but prefer not to)
    rivers.forEach(river => {
      const startX = Math.floor(river.x / this.cellSize);
      const startY = Math.floor(river.y / this.cellSize);
      const endX = Math.floor((river.x + river.width) / this.cellSize);
      const endY = Math.floor((river.y + river.height) / this.cellSize);

      for (let y = Math.max(0, startY); y <= Math.min(this.gridHeight - 1, endY); y++) {
        for (let x = Math.max(0, startX); x <= Math.min(this.gridWidth - 1, endX); x++) {
          if (this.grid[y][x].walkable) {
            this.grid[y][x].cost = 5; // Higher cost to cross water
          }
        }
      }
    });

    // Mark paths as lower cost (agents prefer to use paths)
    this.markPathsAsLowCost();
  }

  private markPathsAsLowCost(): void {
    // Main horizontal path
    const pathY1 = Math.floor(300 / this.cellSize);
    for (let x = 0; x < this.gridWidth; x++) {
      if (this.grid[pathY1] && this.grid[pathY1][x] && this.grid[pathY1][x].walkable) {
        this.grid[pathY1][x].cost = 0.5;
      }
    }

    // Main vertical path
    const pathX1 = Math.floor(400 / this.cellSize);
    for (let y = 0; y < this.gridHeight; y++) {
      if (this.grid[y] && this.grid[y][pathX1] && this.grid[y][pathX1].walkable) {
        this.grid[y][pathX1].cost = 0.5;
      }
    }

    // Town square area
    const squareStartX = Math.floor(320 / this.cellSize);
    const squareEndX = Math.floor(480 / this.cellSize);
    const squareStartY = Math.floor(240 / this.cellSize);
    const squareEndY = Math.floor(360 / this.cellSize);

    for (let y = squareStartY; y <= squareEndY && y < this.gridHeight; y++) {
      for (let x = squareStartX; x <= squareEndX && x < this.gridWidth; x++) {
        if (this.grid[y] && this.grid[y][x] && this.grid[y][x].walkable) {
          this.grid[y][x].cost = 0.3;
        }
      }
    }
  }

  /**
   * Find path using A* algorithm
   */
  findPath(startX: number, startY: number, goalX: number, goalY: number): { x: number; y: number }[] {
    const start = this.worldToGrid(startX, startY);
    const goal = this.worldToGrid(goalX, goalY);

    // Validate start and goal positions
    if (!this.isValidPosition(start.x, start.y) || !this.isValidPosition(goal.x, goal.y)) {
      return [];
    }

    if (!this.grid[start.y][start.x].walkable || !this.grid[goal.y][goal.x].walkable) {
      return [];
    }

    const openSet: PathNode[] = [];
    const closedSet: Set<string> = new Set();

    const startNode: PathNode = {
      x: start.x,
      y: start.y,
      g: 0,
      h: this.heuristic(start.x, start.y, goal.x, goal.y),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;
    openSet.push(startNode);

    while (openSet.length > 0) {
      // Find node with lowest f cost
      openSet.sort((a, b) => a.f - b.f);
      const currentNode = openSet.shift()!;

      const currentKey = `${currentNode.x},${currentNode.y}`;
      if (closedSet.has(currentKey)) {
        continue;
      }
      closedSet.add(currentKey);

      // Goal reached
      if (currentNode.x === goal.x && currentNode.y === goal.y) {
        return this.reconstructPath(currentNode);
      }

      // Check neighbors
      const neighbors = this.getNeighbors(currentNode.x, currentNode.y);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        if (closedSet.has(neighborKey)) {
          continue;
        }

        const movementCost = this.grid[neighbor.y][neighbor.x].cost;
        const tentativeG = currentNode.g + movementCost;

        const existingNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
        if (existingNode && tentativeG >= existingNode.g) {
          continue;
        }

        const neighborNode: PathNode = {
          x: neighbor.x,
          y: neighbor.y,
          g: tentativeG,
          h: this.heuristic(neighbor.x, neighbor.y, goal.x, goal.y),
          f: 0,
          parent: currentNode
        };
        neighborNode.f = neighborNode.g + neighborNode.h;

        if (existingNode) {
          existingNode.g = tentativeG;
          existingNode.f = neighborNode.f;
          existingNode.parent = currentNode;
        } else {
          openSet.push(neighborNode);
        }
      }
    }

    return []; // No path found
  }

  private worldToGrid(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: Math.floor(worldX / this.cellSize),
      y: Math.floor(worldY / this.cellSize)
    };
  }

  private gridToWorld(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: gridX * this.cellSize + this.cellSize / 2,
      y: gridY * this.cellSize + this.cellSize / 2
    };
  }

  private isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
  }

  private heuristic(x1: number, y1: number, x2: number, y2: number): number {
    // Manhattan distance
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  private getNeighbors(x: number, y: number): { x: number; y: number }[] {
    const neighbors = [];
    const directions = [
      { x: 0, y: -1 }, // North
      { x: 1, y: 0 },  // East
      { x: 0, y: 1 },  // South
      { x: -1, y: 0 }, // West
      { x: 1, y: -1 }, // Northeast
      { x: 1, y: 1 },  // Southeast
      { x: -1, y: 1 }, // Southwest
      { x: -1, y: -1 } // Northwest
    ];

    for (const dir of directions) {
      const newX = x + dir.x;
      const newY = y + dir.y;

      if (this.isValidPosition(newX, newY) && this.grid[newY][newX].walkable) {
        neighbors.push({ x: newX, y: newY });
      }
    }

    return neighbors;
  }

  private reconstructPath(node: PathNode): { x: number; y: number }[] {
    const path = [];
    let current: PathNode | null = node;

    while (current) {
      const worldPos = this.gridToWorld(current.x, current.y);
      path.unshift(worldPos);
      current = current.parent;
    }

    return path;
  }

  /**
   * Smooth the path to make movement more natural
   */
  smoothPath(path: { x: number; y: number }[]): { x: number; y: number }[] {
    if (path.length <= 2) return path;

    const smoothed = [path[0]]; // Always include start point
    
    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1];
      const current = path[i];
      const next = path[i + 1];

      // Calculate direction changes
      const dir1 = { x: current.x - prev.x, y: current.y - prev.y };
      const dir2 = { x: next.x - current.x, y: next.y - current.y };

      // Only add point if there's a significant direction change
      const dotProduct = dir1.x * dir2.x + dir1.y * dir2.y;
      const mag1 = Math.sqrt(dir1.x * dir1.x + dir1.y * dir1.y);
      const mag2 = Math.sqrt(dir2.x * dir2.x + dir2.y * dir2.y);
      
      if (mag1 > 0 && mag2 > 0) {
        const cosAngle = dotProduct / (mag1 * mag2);
        if (cosAngle < 0.9) { // Significant direction change
          smoothed.push(current);
        }
      }
    }

    smoothed.push(path[path.length - 1]); // Always include end point
    return smoothed;
  }

  /**
   * Get a random walkable position near a target
   */
  getRandomNearbyPosition(targetX: number, targetY: number, radius: number = 100): { x: number; y: number } | null {
    const attempts = 20;
    
    for (let i = 0; i < attempts; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const x = targetX + Math.cos(angle) * distance;
      const y = targetY + Math.sin(angle) * distance;

      const gridPos = this.worldToGrid(x, y);
      if (this.isValidPosition(gridPos.x, gridPos.y) && this.grid[gridPos.y][gridPos.x].walkable) {
        return { x, y };
      }
    }

    return null; // No valid position found
  }
}
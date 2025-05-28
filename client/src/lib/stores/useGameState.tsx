import { create } from "zustand";

export interface Building {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Camera {
  x: number;
  y: number;
}

interface GameState {
  playerPosition: Position;
  camera: Camera;
  interactableBuildings: Building[];
  selectedBuilding: Building | null;
  
  // Actions
  setPlayerPosition: (position: Position) => void;
  setCamera: (camera: Camera) => void;
  setInteractableBuildings: (buildings: Building[]) => void;
  setSelectedBuilding: (building: Building | null) => void;
}

export const useGameState = create<GameState>((set) => ({
  playerPosition: { x: 400, y: 300 },
  camera: { x: 0, y: 0 },
  interactableBuildings: [],
  selectedBuilding: null,
  
  setPlayerPosition: (position) => set({ playerPosition: position }),
  setCamera: (camera) => set({ camera: camera }),
  setInteractableBuildings: (buildings) => set({ interactableBuildings: buildings }),
  setSelectedBuilding: (building) => set({ selectedBuilding: building }),
}));

import React, { useRef, useEffect, useCallback } from "react";
import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";
import Player from "./Player";
import Map from "./Map";
import GameUI from "./GameUI";
import AIAgents from "./AIAgents";
import AIControlPanel from "./AIControlPanel";
import { GameEngine } from "../lib/gameEngine";

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const animationFrameRef = useRef<number>();
  
  const { 
    playerPosition, 
    setPlayerPosition, 
    camera, 
    setCamera,
    interactableBuildings,
    setInteractableBuildings,
    selectedBuilding,
    setSelectedBuilding
  } = useGameState();
  
  const { backgroundMusic, isMuted, playHit, playSuccess } = useAudio();

  // Initialize game engine
  useEffect(() => {
    if (canvasRef.current) {
      gameEngineRef.current = new GameEngine(canvasRef.current);
      
      // Set up buildings data based on new map layout
      const buildings = [
        // Top row buildings
        { id: 'handy-man', name: 'Handy Man Workshop', x: 120, y: 150, width: 80, height: 60, type: 'workshop' },
        { id: 'doctors-clinic', name: "Doctor's Clinic", x: 580, y: 150, width: 80, height: 60, type: 'clinic' },
        { id: 'mayors-hall', name: "Mayor's Hall", x: 50, y: 280, width: 70, height: 50, type: 'hall' },
        { id: 'non-organic-waste', name: 'Non-Organic Waste', x: 650, y: 320, width: 70, height: 60, type: 'waste' },
        { id: 'organic-compost', name: 'Organic Compost', x: 650, y: 420, width: 70, height: 60, type: 'compost' },
        
        // Bottom row buildings
        { id: 'farmers-house', name: 'Farmers House', x: 480, y: 420, width: 70, height: 50, type: 'farm' },
        { id: 'granary-storage', name: 'Granary Storage', x: 580, y: 420, width: 70, height: 50, type: 'granary' },
        
        // Fields and preparation areas
        { id: 'wheat-field', name: 'Wheat Field', x: 100, y: 420, width: 80, height: 50, type: 'field' },
        { id: 'grain-field', name: 'Grain Field', x: 200, y: 420, width: 80, height: 50, type: 'field' },
        { id: 'preparation-area', name: 'Preparation Area', x: 80, y: 480, width: 120, height: 40, type: 'preparation' },
        
        // Town square monument
        { id: 'town-statue', name: 'Town Square Monument', x: 380, y: 280, width: 40, height: 40, type: 'monument' },
      ];
      
      setInteractableBuildings(buildings);
    }
  }, [setInteractableBuildings]);

  // Handle keyboard input
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!gameEngineRef.current) return;
    
    const speed = 3;
    let newX = playerPosition.x;
    let newY = playerPosition.y;
    let moved = false;

    switch (event.key) {
      case 'w':
      case 'W':
      case 'ArrowUp':
        newY = Math.max(50, playerPosition.y - speed);
        moved = true;
        console.log('Moving up');
        break;
      case 's':
      case 'S':
      case 'ArrowDown':
        newY = Math.min(550, playerPosition.y + speed);
        moved = true;
        console.log('Moving down');
        break;
      case 'a':
      case 'A':
      case 'ArrowLeft':
        newX = Math.max(50, playerPosition.x - speed);
        moved = true;
        console.log('Moving left');
        break;
      case 'd':
      case 'D':
      case 'ArrowRight':
        newX = Math.min(750, playerPosition.x + speed);
        moved = true;
        console.log('Moving right');
        break;
      case 'e':
      case ' ':
        // Interaction key
        const nearbyBuilding = interactableBuildings.find(building => {
          const distance = Math.sqrt(
            Math.pow(playerPosition.x - (building.x + building.width / 2), 2) +
            Math.pow(playerPosition.y - (building.y + building.height / 2), 2)
          );
          return distance < 60;
        });
        
        if (nearbyBuilding) {
          setSelectedBuilding(nearbyBuilding);
          playSuccess();
          console.log(`Interacting with ${nearbyBuilding.name}`);
        }
        break;
    }

    // Check for collisions before moving
    if (moved) {
      const canMove = gameEngineRef.current.checkCollision(newX, newY, interactableBuildings);
      if (canMove) {
        setPlayerPosition({ x: newX, y: newY });
        
        // Update camera to follow player
        setCamera({
          x: newX - 400, // Center player on screen
          y: newY - 300
        });
      } else {
        playHit(); // Play hit sound when hitting a wall
      }
    }
  }, [playerPosition, setPlayerPosition, setCamera, interactableBuildings, setSelectedBuilding, playHit, playSuccess]);

  // Set up event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Start background music
  useEffect(() => {
    if (backgroundMusic && !isMuted) {
      backgroundMusic.play().catch(console.log);
    }
  }, [backgroundMusic, isMuted]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.render(playerPosition, camera, interactableBuildings);
    }
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [playerPosition, camera, interactableBuildings]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  return (
    <div className="game-container">
      <canvas 
        ref={canvasRef}
        width={800}
        height={600}
        className="game-canvas"
      />
      <AIAgents />
      <GameUI />
      <Player />
      <Map />
      <AIControlPanel />
    </div>
  );
};

export default Game;

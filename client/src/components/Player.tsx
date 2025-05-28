import React from "react";
import { useGameState } from "../lib/stores/useGameState";

const Player: React.FC = () => {
  const { playerPosition } = useGameState();

  return (
    <div 
      className="player-sprite"
      style={{
        position: 'absolute',
        left: `${playerPosition.x - 8}px`,
        top: `${playerPosition.y - 8}px`,
        width: '16px',
        height: '16px',
        backgroundColor: '#4a90e2',
        border: '2px solid #2c5985',
        borderRadius: '2px',
        zIndex: 100,
        transition: 'none',
        pointerEvents: 'none'
      }}
    />
  );
};

export default Player;

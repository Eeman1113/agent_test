import React from "react";
import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";

const GameUI: React.FC = () => {
  const { selectedBuilding, setSelectedBuilding, interactableBuildings, playerPosition } = useGameState();
  const { toggleMute, isMuted } = useAudio();

  const nearbyBuilding = interactableBuildings.find(building => {
    const distance = Math.sqrt(
      Math.pow(playerPosition.x - (building.x + building.width / 2), 2) +
      Math.pow(playerPosition.y - (building.y + building.height / 2), 2)
    );
    return distance < 60;
  });

  return (
    <div className="game-ui">
      {/* Controls Info */}
      <div className="controls-panel">
        <h3>Controls</h3>
        <div className="control-item">WASD / Arrow Keys - Move</div>
        <div className="control-item">E / Space - Interact</div>
        <button 
          onClick={toggleMute}
          className="mute-button"
        >
          {isMuted ? "🔇 Unmute" : "🔊 Mute"}
        </button>
      </div>

      {/* Interaction Prompt */}
      {nearbyBuilding && !selectedBuilding && (
        <div className="interaction-prompt">
          <div className="prompt-text">
            Press E to enter {nearbyBuilding.name}
          </div>
        </div>
      )}

      {/* Building Dialog */}
      {selectedBuilding && (
        <div className="building-dialog">
          <div className="dialog-content">
            <h2>{selectedBuilding.name}</h2>
            <p>Welcome to the {selectedBuilding.name}!</p>
            <p>This is a {selectedBuilding.type} in Fantasy Town.</p>
            <div className="dialog-actions">
              <button 
                onClick={() => setSelectedBuilding(null)}
                className="close-button"
              >
                Leave Building
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Player Position Debug */}
      <div className="debug-info">
        Player: ({Math.round(playerPosition.x)}, {Math.round(playerPosition.y)})
      </div>
    </div>
  );
};

export default GameUI;

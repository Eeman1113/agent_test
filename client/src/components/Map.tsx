import React from "react";
import { useGameState } from "../lib/stores/useGameState";

const Map: React.FC = () => {
  const { interactableBuildings, playerPosition } = useGameState();

  return (
    <div className="mini-map">
      <div className="mini-map-title">Fantasy Town</div>
      <div className="mini-map-content">
        {interactableBuildings.map((building) => (
          <div
            key={building.id}
            className={`mini-building mini-building-${building.type}`}
            style={{
              left: `${(building.x / 800) * 100}%`,
              top: `${(building.y / 600) * 100}%`,
              width: `${(building.width / 800) * 100}%`,
              height: `${(building.height / 600) * 100}%`,
            }}
          />
        ))}
        <div
          className="mini-player"
          style={{
            left: `${(playerPosition.x / 800) * 100}%`,
            top: `${(playerPosition.y / 600) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

export default Map;

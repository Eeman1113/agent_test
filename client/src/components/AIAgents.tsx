import React, { useEffect } from "react";
import { useAIAgents } from "../lib/aiAgents";

const AIAgents: React.FC = () => {
  const { agents, initializeAgents, simulateAgentActions, isSimulationRunning } = useAIAgents();

  useEffect(() => {
    if (agents.length === 0) {
      initializeAgents([]);
    }
  }, [agents.length, initializeAgents]);

  useEffect(() => {
    if (isSimulationRunning) {
      const interval = setInterval(() => {
        simulateAgentActions();
      }, 2000); // Update every 2 seconds

      return () => clearInterval(interval);
    }
  }, [isSimulationRunning, simulateAgentActions]);

  const getAgentColor = (role: string) => {
    const colors = {
      handyman: "#CD853F",
      toolsmith: "#4682B4", 
      doctor: "#FFB6C1",
      mayor: "#DAA520",
      farmer: "#32CD32"
    };
    return colors[role as keyof typeof colors] || "#888";
  };

  return (
    <>
      {agents.map((agent) => (
        <div key={agent.id}>
          {/* Agent sprite */}
          <div
            className="ai-agent"
            style={{
              position: 'absolute',
              left: `${agent.position.x - 10}px`,
              top: `${agent.position.y - 10}px`,
              width: '20px',
              height: '20px',
              backgroundColor: getAgentColor(agent.role),
              border: '2px solid #000',
              borderRadius: '50%',
              zIndex: 99,
              transition: 'all 0.5s ease',
              pointerEvents: 'none'
            }}
          />
          
          {/* Agent name label */}
          <div
            className="agent-name-label"
            style={{
              position: 'absolute',
              left: `${agent.position.x - 25}px`,
              top: `${agent.position.y - 35}px`,
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              fontFamily: 'Courier New',
              whiteSpace: 'nowrap',
              zIndex: 98,
              pointerEvents: 'none'
            }}
          >
            {agent.name}
          </div>

          {/* Speech bubble for recent emoji messages */}
          {agent.lastMessage && (
            <div
              className="agent-speech-bubble"
              style={{
                position: 'absolute',
                left: `${agent.position.x + 15}px`,
                top: `${agent.position.y - 40}px`,
                background: 'white',
                border: '2px solid #333',
                borderRadius: '12px',
                padding: '4px 8px',
                fontSize: '14px',
                zIndex: 100,
                animation: 'fadeIn 0.5s ease',
                pointerEvents: 'none'
              }}
            >
              {agent.lastMessage.emojis[0]} {agent.lastMessage.emojis[1]}
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default AIAgents;
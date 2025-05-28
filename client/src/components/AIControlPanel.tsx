import React from "react";
import { useAIAgents } from "../lib/aiAgents";

const AIControlPanel: React.FC = () => {
  const { 
    agents, 
    messages, 
    gameDay, 
    gameTime, 
    isSimulationRunning, 
    setSimulationRunning,
    advanceTime 
  } = useAIAgents();

  const getLatestMessages = () => {
    return messages.slice(-5).reverse(); // Show last 5 messages
  };

  return (
    <div className="ai-control-panel">
      <div className="ai-panel-header">
        <h3>🤖 AI Town Simulation</h3>
        <div className="simulation-time">
          Day {gameDay} - {gameTime}
        </div>
      </div>

      <div className="simulation-controls">
        <button 
          onClick={() => setSimulationRunning(!isSimulationRunning)}
          className={`simulation-toggle ${isSimulationRunning ? 'running' : 'stopped'}`}
        >
          {isSimulationRunning ? '⏸️ Pause AI' : '▶️ Start AI'}
        </button>
        
        <button 
          onClick={advanceTime}
          className="advance-time-btn"
          disabled={isSimulationRunning}
        >
          ⏰ +30min
        </button>
      </div>

      <div className="agents-status">
        <h4>👥 Agents ({agents.length})</h4>
        <div className="agents-grid">
          {agents.map((agent) => (
            <div key={agent.id} className="agent-card">
              <div className="agent-header">
                <span className="agent-name">{agent.name}</span>
                <span className="agent-role">({agent.role})</span>
              </div>
              <div className="agent-status">
                <div className="status-bar">
                  <span>❤️ {agent.health}%</span>
                  <span>⚡ {agent.energy}%</span>
                </div>
                <div className="agent-action">
                  📋 {agent.currentAction}
                </div>
              </div>
              {agent.lastMessage && (
                <div className="agent-last-message">
                  💬 {agent.lastMessage.emojis[0]} {agent.lastMessage.emojis[1]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="recent-communications">
        <h4>💬 Recent Communications</h4>
        <div className="messages-list">
          {getLatestMessages().length > 0 ? (
            getLatestMessages().map((message, index) => (
              <div key={index} className="message-item">
                <div className="message-header">
                  <span className="message-from">
                    {agents.find(a => a.id === message.from)?.name || message.from}
                  </span>
                  <span className="message-arrow">→</span>
                  <span className="message-to">
                    {agents.find(a => a.id === message.to)?.name || message.to}
                  </span>
                  <span className="message-time">{message.timestamp}</span>
                </div>
                <div className="message-emojis">
                  {message.emojis[0]} {message.emojis[1]}
                </div>
              </div>
            ))
          ) : (
            <div className="no-messages">No communications yet...</div>
          )}
        </div>
      </div>

      <div className="ai-help-text">
        <p>🎯 The AI agents will move around town, perform their daily tasks, and communicate using 2-emoji messages!</p>
        <p>💡 Each agent has their own personality, memories, and goals based on their role in Fantasy Town.</p>
      </div>
    </div>
  );
};

export default AIControlPanel;
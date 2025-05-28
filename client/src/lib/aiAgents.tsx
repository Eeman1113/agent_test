import { create } from "zustand";
import { Building, Position } from "./stores/useGameState";
import { Pathfinder } from "./pathfinding";
import { GenerativeAgent } from "./generativeAgent";

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  position: Position;
  currentAction: string;
  currentPlan: string[];
  health: number;
  energy: number;
  memoryCount: number;
  lastMessage: { emojis: [string, string]; timestamp: string } | null;
  isActive: boolean;
  agent?: GenerativeAgent; // The actual generative agent instance
}

export interface AIMessage {
  from: string;
  to: string;
  emojis: [string, string];
  intent: string;
  timestamp: string;
}

interface AIAgentState {
  agents: AIAgent[];
  messages: AIMessage[];
  gameDay: number;
  gameTime: string;
  isSimulationRunning: boolean;
  pathfinder: Pathfinder | null;
  generativeAgents: GenerativeAgent[];
  
  // Actions
  initializeAgents: (buildings: Building[]) => void;
  updateAgentPosition: (agentId: string, position: Position) => void;
  addMessage: (message: AIMessage) => void;
  setSimulationRunning: (running: boolean) => void;
  advanceTime: () => void;
  simulateAgentActions: () => void;
}

export const useAIAgents = create<AIAgentState>((set, get) => ({
  agents: [],
  messages: [],
  gameDay: 1,
  gameTime: "08:00",
  isSimulationRunning: false,
  pathfinder: null,
  generativeAgents: [],
  
  initializeAgents: (buildings: Building[] = []) => {
    // Initialize pathfinder
    const pathfinder = new Pathfinder(800, 600, 20);
    pathfinder.updateObstacles(buildings, [{ x: 0, y: 520, width: 800, height: 80 }]);
    
    set({ pathfinder });
    const initialAgents: AIAgent[] = [
      {
        id: "handyman-bob",
        name: "Bob",
        role: "handyman",
        description: "A skilled handyman who fixes things around town",
        position: { x: 120, y: 170 },
        currentAction: "Starting the day",
        currentPlan: ["Check workshop tools", "Visit buildings for repairs", "Rest"],
        health: 100,
        energy: 100,
        memoryCount: 1,
        lastMessage: null,
        isActive: true
      },
      {
        id: "toolsmith-smith",
        name: "Smith",
        role: "toolsmith", 
        description: "A master craftsperson who creates tools",
        position: { x: 600, y: 170 },
        currentAction: "Preparing forge",
        currentPlan: ["Heat up forge", "Craft tools", "Meet with customers"],
        health: 100,
        energy: 100,
        memoryCount: 1,
        lastMessage: null,
        isActive: true
      },
      {
        id: "doctor-helen",
        name: "Dr. Helen",
        role: "doctor",
        description: "The town doctor who cares for everyone's health",
        position: { x: 600, y: 170 },
        currentAction: "Organizing medical supplies",
        currentPlan: ["Check medicine garden", "Review patient notes", "Be available for emergencies"],
        health: 100,
        energy: 100,
        memoryCount: 1,
        lastMessage: null,
        isActive: true
      },
      {
        id: "mayor-wilson", 
        name: "Mayor Wilson",
        role: "mayor",
        description: "The town mayor who makes important decisions",
        position: { x: 70, y: 300 },
        currentAction: "Reviewing town business",
        currentPlan: ["Meet with citizens", "Plan town improvements", "Address concerns"],
        health: 100,
        energy: 100,
        memoryCount: 1,
        lastMessage: null,
        isActive: true
      },
      {
        id: "farmer-joe",
        name: "Farmer Joe", 
        role: "farmer",
        description: "A hardworking farmer who grows crops",
        position: { x: 500, y: 440 },
        currentAction: "Tending to crops",
        currentPlan: ["Water plants", "Check harvest readiness", "Prepare soil"],
        health: 100,
        energy: 100,
        memoryCount: 1,
        lastMessage: null,
        isActive: true
      }
    ];
    
    set({ agents: initialAgents });
  },
  
  updateAgentPosition: (agentId: string, position: Position) => {
    set((state) => ({
      agents: state.agents.map(agent =>
        agent.id === agentId ? { ...agent, position } : agent
      )
    }));
  },
  
  addMessage: (message: AIMessage) => {
    set((state) => ({
      messages: [...state.messages.slice(-20), message], // Keep last 20 messages
      agents: state.agents.map(agent =>
        agent.id === message.from 
          ? { ...agent, lastMessage: { emojis: message.emojis, timestamp: message.timestamp } }
          : agent
      )
    }));
  },
  
  setSimulationRunning: (running: boolean) => {
    set({ isSimulationRunning: running });
  },
  
  advanceTime: () => {
    const state = get();
    let [hours, minutes] = state.gameTime.split(':').map(Number);
    
    minutes += 30; // Advance by 30 minutes
    if (minutes >= 60) {
      minutes = 0;
      hours += 1;
    }
    
    if (hours >= 24) {
      hours = 8; // Reset to 8 AM
      set({ gameDay: state.gameDay + 1 });
    }
    
    set({ gameTime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}` });
  },
  
  simulateAgentActions: () => {
    const state = get();
    if (!state.isSimulationRunning) return;
    
    // Simulate agent movements and actions
    const updatedAgents = state.agents.map(agent => {
      // Simple AI behavior - move agents slightly and update actions
      const newPosition = {
        x: agent.position.x + (Math.random() - 0.5) * 20,
        y: agent.position.y + (Math.random() - 0.5) * 20
      };
      
      // Keep agents within bounds
      newPosition.x = Math.max(50, Math.min(750, newPosition.x));
      newPosition.y = Math.max(150, Math.min(500, newPosition.y));
      
      // Update current action from plan
      let newAction = agent.currentAction;
      if (agent.currentPlan.length > 0 && Math.random() < 0.3) {
        newAction = agent.currentPlan[Math.floor(Math.random() * agent.currentPlan.length)];
      }
      
      return {
        ...agent,
        position: newPosition,
        currentAction: newAction,
        energy: Math.max(20, agent.energy - 1)
      };
    });
    
    set({ agents: updatedAgents });
    
    // Occasionally generate communications between agents
    if (Math.random() < 0.2) {
      const activeAgents = updatedAgents.filter(a => a.isActive);
      if (activeAgents.length >= 2) {
        const fromAgent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
        const toAgent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
        
        if (fromAgent.id !== toAgent.id) {
          const emojiPairs = [
            ["👋", "😊"], ["🔨", "❓"], ["✅", "👍"], ["🌾", "🍞"], 
            ["💊", "❤️"], ["📋", "⭐"], ["🛠️", "🔧"], ["🙏", "😊"]
          ];
          
          const randomEmojis = emojiPairs[Math.floor(Math.random() * emojiPairs.length)] as [string, string];
          
          const message: AIMessage = {
            from: fromAgent.id,
            to: toAgent.id,
            emojis: randomEmojis,
            intent: "communication",
            timestamp: `Day ${state.gameDay} ${state.gameTime}`
          };
          
          get().addMessage(message);
        }
      }
    }
  }
}));
"""
AI Agent System for Fantasy Town Simulation
Based on the Generative Agents architecture with Ollama integration
"""

import json
import time
from datetime import datetime
from typing import List, Dict, Optional, Tuple
import requests
import ollama

class Memory:
    """Represents a single memory entry in an agent's memory stream"""
    
    def __init__(self, description: str, memory_type: str, importance_score: int = 5, 
                 related_agents: List[str] = None, game_day: int = 1, game_time: str = "00:00"):
        self.description = description
        self.memory_type = memory_type  # observation, reflection, plan, communication
        self.importance_score = importance_score  # 1-10 scale
        self.related_agents = related_agents or []
        self.game_day = game_day
        self.game_time = game_time
        self.timestamp = f"Day {game_day} {game_time}"
        self.last_accessed = time.time()
    
    def to_dict(self):
        return {
            "description": self.description,
            "type": self.memory_type,
            "importance": self.importance_score,
            "related_agents": self.related_agents,
            "timestamp": self.timestamp,
            "last_accessed": self.last_accessed
        }

class AIAgent:
    """
    An AI agent with cognitive architecture including memory, reflection, and planning
    """
    
    def __init__(self, name: str, role: str, description: str, starting_location: Tuple[int, int]):
        self.name = name
        self.role = role  # handyman, toolsmith, doctor, mayor, farmer
        self.description = description
        self.location = starting_location
        self.memory_stream: List[Memory] = []
        self.current_plan: List[str] = []
        self.current_action = "idle"
        self.daily_schedule = []
        self.health = 100
        self.energy = 100
        self.social_connections = {}
        self.emoji_vocabulary = self._init_emoji_vocabulary()
        
    def _init_emoji_vocabulary(self):
        """Initialize role-specific emoji vocabulary for 2-emoji communication"""
        base_emojis = {
            "greeting": "👋", "yes": "✅", "no": "❌", "help": "❓", "thanks": "🙏",
            "work": "🔨", "food": "🍞", "sick": "😷", "happy": "😊", "sad": "😢"
        }
        
        role_specific = {
            "handyman": {"tool": "🔧", "fix": "🛠️", "build": "🏗️", "broken": "💔"},
            "toolsmith": {"hammer": "🔨", "metal": "⚙️", "forge": "🔥", "craft": "✨"},
            "doctor": {"medicine": "💊", "heal": "❤️", "bandage": "🩹", "emergency": "🚨"},
            "mayor": {"meeting": "📋", "town": "🏘️", "important": "⭐", "decision": "⚖️"},
            "farmer": {"plant": "🌱", "harvest": "🌾", "water": "💧", "grow": "🌿"}
        }
        
        return {**base_emojis, **role_specific.get(self.role, {})}
    
    def add_memory(self, description: str, memory_type: str, importance_score: int = 5, 
                   related_agents: List[str] = None, game_day: int = 1, game_time: str = "00:00"):
        """Add a new memory to the agent's memory stream"""
        memory = Memory(description, memory_type, importance_score, related_agents, game_day, game_time)
        self.memory_stream.append(memory)
        
        # Keep memory stream manageable (last 100 memories)
        if len(self.memory_stream) > 100:
            self.memory_stream = self.memory_stream[-100:]
    
    def retrieve_relevant_memories(self, query: str, max_memories: int = 5) -> List[Memory]:
        """Retrieve the most relevant memories based on recency, importance, and relevance"""
        current_time = time.time()
        scored_memories = []
        
        for memory in self.memory_stream:
            # Recency score (more recent = higher score)
            time_diff = current_time - memory.last_accessed
            recency_score = max(0, 10 - (time_diff / 3600))  # Decay over hours
            
            # Importance score (already 1-10)
            importance_score = memory.importance_score
            
            # Relevance score (simple keyword matching)
            relevance_score = 0
            query_words = query.lower().split()
            memory_words = memory.description.lower().split()
            
            for word in query_words:
                if word in memory_words:
                    relevance_score += 2
            
            # Check for related agents
            for agent in memory.related_agents:
                if agent.lower() in query.lower():
                    relevance_score += 3
            
            total_score = recency_score + importance_score + relevance_score
            scored_memories.append((memory, total_score))
            
            # Update last accessed time
            memory.last_accessed = current_time
        
        # Sort by score and return top memories
        scored_memories.sort(key=lambda x: x[1], reverse=True)
        return [memory for memory, _ in scored_memories[:max_memories]]
    
    def generate_emoji_message(self, intent: str, target_agent: str = None) -> Tuple[str, str]:
        """Generate a 2-emoji message based on intent"""
        # This is a simplified version - in full implementation, would use Ollama
        # to intelligently select emojis based on context and memory
        
        common_patterns = {
            "greet": ("👋", "😊"),
            "ask_help": ("❓", "🙏"),
            "say_thanks": ("🙏", "😊"),
            "work_together": ("🔨", "👥"),
            "need_food": ("🍞", "❓"),
            "feeling_sick": ("😷", "❓"),
            "work_done": ("✅", "😊"),
            "emergency": ("🚨", "❓")
        }
        
        # Role-specific patterns
        if self.role == "handyman":
            role_patterns = {
                "need_tools": ("🔧", "❓"),
                "fixing": ("🛠️", "🔨"),
                "repair_done": ("✅", "🔧")
            }
        elif self.role == "farmer":
            role_patterns = {
                "harvest_ready": ("🌾", "✅"),
                "need_water": ("💧", "❓"),
                "planting": ("🌱", "🔨")
            }
        else:
            role_patterns = {}
        
        all_patterns = {**common_patterns, **role_patterns}
        return all_patterns.get(intent, ("❓", "😊"))

class OllamaConnection:
    """Handles connection to Ollama for LLM inference"""
    
    def __init__(self, host: str = "localhost", port: int = 11434):
        self.host = host
        self.port = port
        self.base_url = f"http://{host}:{port}"
        self.model = "llama3.2:latest"  # Default model
        
    def is_available(self) -> bool:
        """Check if Ollama service is available"""
        try:
            response = requests.get(f"{self.base_url}/api/version", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def list_models(self) -> List[str]:
        """List available models"""
        try:
            response = requests.get(f"{self.base_url}/api/tags")
            if response.status_code == 200:
                data = response.json()
                return [model["name"] for model in data.get("models", [])]
        except:
            pass
        return []
    
    def generate_response(self, prompt: str, model: str = None) -> str:
        """Generate a response using Ollama"""
        try:
            response = ollama.chat(
                model=model or self.model,
                messages=[{"role": "user", "content": prompt}]
            )
            return response["message"]["content"]
        except Exception as e:
            print(f"Error generating response: {e}")
            return "I'm having trouble thinking right now."

class AgentSimulation:
    """Main simulation controller for AI agents"""
    
    def __init__(self):
        self.agents: Dict[str, AIAgent] = {}
        self.game_day = 1
        self.game_time = "08:00"
        self.simulation_log = []
        self.ollama = OllamaConnection()
        self.is_running = False
        
    def initialize_agents(self):
        """Initialize the five AI agents with their roles and starting locations"""
        agent_configs = [
            {
                "name": "Bob",
                "role": "handyman", 
                "description": "A skilled handyman who fixes things around town and helps others with repairs",
                "location": (120, 150)  # Handyman workshop
            },
            {
                "name": "Smith", 
                "role": "toolsmith",
                "description": "A master craftsperson who creates tools and metal goods for the town",
                "location": (580, 150)  # Toolsmith area  
            },
            {
                "name": "Dr. Helen",
                "role": "doctor",
                "description": "The town doctor who cares for everyone's health and tends to the sick",
                "location": (580, 150)  # Doctor's clinic
            },
            {
                "name": "Mayor Wilson",
                "role": "mayor", 
                "description": "The town mayor who makes important decisions and organizes community events",
                "location": (50, 280)  # Mayor's hall
            },
            {
                "name": "Farmer Joe",
                "role": "farmer",
                "description": "A hardworking farmer who grows crops and provides food for the town",
                "location": (480, 420)  # Farmer's house
            }
        ]
        
        for config in agent_configs:
            agent = AIAgent(
                config["name"], 
                config["role"], 
                config["description"], 
                config["location"]
            )
            
            # Add initial memories
            agent.add_memory(
                f"I am {config['name']}, the town {config['role']}. {config['description']}", 
                "reflection", 
                importance_score=10,
                game_day=1,
                game_time="08:00"
            )
            
            self.agents[config["name"]] = agent
            
        print(f"Initialized {len(self.agents)} AI agents")
    
    def check_ollama_connection(self) -> bool:
        """Check if Ollama is available for AI processing"""
        if self.ollama.is_available():
            models = self.ollama.list_models()
            print(f"Ollama is available with models: {models}")
            return True
        else:
            print("Ollama service is not available. AI features will be limited.")
            return False
    
    def simulate_day(self):
        """Simulate one day in the town"""
        print(f"\n=== Day {self.game_day} ===")
        
        # Morning planning phase
        for agent_name, agent in self.agents.items():
            self.generate_daily_plan(agent)
        
        # Simulate hourly activities
        for hour in range(8, 20):  # 8 AM to 8 PM
            self.game_time = f"{hour:02d}:00"
            print(f"\nTime: {self.game_time}")
            
            for agent_name, agent in self.agents.items():
                self.execute_agent_action(agent)
            
            # Check for random events or interactions
            self.check_for_interactions()
        
        # Evening reflection phase
        for agent_name, agent in self.agents.items():
            self.generate_reflections(agent)
        
        self.game_day += 1
    
    def generate_daily_plan(self, agent: AIAgent):
        """Generate a daily plan for an agent using Ollama"""
        if not self.ollama.is_available():
            # Fallback simple planning
            agent.current_plan = [f"Work at {agent.role} duties", "Rest", "Socialize"]
            return
        
        # Get recent memories for context
        relevant_memories = agent.retrieve_relevant_memories("daily planning work", max_memories=3)
        memory_context = "\n".join([f"- {m.description}" for m in relevant_memories])
        
        prompt = f"""You are {agent.name}, the town {agent.role}. {agent.description}

Recent memories:
{memory_context}

It's Day {self.game_day}, {self.game_time}. Plan your day with 3-5 main activities. 
Be specific and consider your role's responsibilities and the town's needs.

Respond with a simple list like:
1. Check workshop tools
2. Visit farmer about fence repair  
3. Work on town hall door
4. Rest and eat lunch
5. Evening social time"""

        try:
            response = self.ollama.generate_response(prompt)
            # Parse the response into a plan
            plan_items = []
            for line in response.split('\n'):
                if line.strip() and (line.strip()[0].isdigit() or line.strip().startswith('-')):
                    plan_items.append(line.strip())
            
            agent.current_plan = plan_items
            agent.add_memory(f"Made daily plan: {'; '.join(plan_items)}", "plan", 
                           importance_score=6, game_day=self.game_day, game_time=self.game_time)
            
        except Exception as e:
            print(f"Error generating plan for {agent.name}: {e}")
            agent.current_plan = [f"Work on {agent.role} duties", "Rest", "Socialize"]
    
    def execute_agent_action(self, agent: AIAgent):
        """Execute the current action for an agent"""
        if not agent.current_plan:
            agent.current_action = "idle"
            return
        
        # Simple action execution - in full version would be more sophisticated
        current_plan_item = agent.current_plan[0] if agent.current_plan else "idle"
        agent.current_action = current_plan_item
        
        # Log the action
        action_description = f"{agent.name} is doing: {current_plan_item}"
        print(f"  {action_description}")
        
        agent.add_memory(action_description, "observation", 
                        importance_score=3, game_day=self.game_day, game_time=self.game_time)
        
        # Move to next plan item occasionally
        if len(agent.current_plan) > 1 and self.game_time.endswith("00"):
            agent.current_plan.pop(0)
    
    def check_for_interactions(self):
        """Check for potential agent interactions"""
        # Simple interaction logic - agents might communicate based on proximity
        agent_list = list(self.agents.values())
        
        for i, agent1 in enumerate(agent_list):
            for agent2 in agent_list[i+1:]:
                # Calculate distance (simplified)
                distance = ((agent1.location[0] - agent2.location[0])**2 + 
                           (agent1.location[1] - agent2.location[1])**2)**0.5
                
                # If agents are close, they might interact
                if distance < 100 and len(agent1.memory_stream) > 5:
                    self.create_interaction(agent1, agent2)
    
    def create_interaction(self, agent1: AIAgent, agent2: AIAgent):
        """Create an interaction between two agents"""
        # Generate emoji communication
        intent = "greet"  # Simplified - would use Ollama to determine intent
        emoji1, emoji2 = agent1.generate_emoji_message(intent, agent2.name)
        
        interaction_description = f"{agent1.name} communicates to {agent2.name}: [{emoji1}, {emoji2}]"
        print(f"    🤝 {interaction_description}")
        
        # Both agents remember this interaction
        for agent in [agent1, agent2]:
            agent.add_memory(interaction_description, "communication",
                           importance_score=4, related_agents=[agent1.name, agent2.name],
                           game_day=self.game_day, game_time=self.game_time)
    
    def generate_reflections(self, agent: AIAgent):
        """Generate end-of-day reflections for an agent"""
        if not self.ollama.is_available():
            return
        
        # Get today's important memories
        today_memories = [m for m in agent.memory_stream 
                         if f"Day {self.game_day}" in m.timestamp and m.importance_score >= 4]
        
        if len(today_memories) < 2:
            return
        
        memory_summaries = "\n".join([f"- {m.description}" for m in today_memories])
        
        prompt = f"""You are {agent.name}, the town {agent.role}. Reflect on your day.

Today's important events:
{memory_summaries}

What are 2-3 key insights or reflections about:
- Your work and progress
- Relationships with other townspeople  
- The overall state of the town
- Plans for tomorrow

Keep reflections concise and insightful."""

        try:
            response = self.ollama.generate_response(prompt)
            agent.add_memory(f"Daily reflection: {response}", "reflection",
                           importance_score=7, game_day=self.game_day, game_time="20:00")
            print(f"  💭 {agent.name} reflects: {response[:100]}...")
            
        except Exception as e:
            print(f"Error generating reflection for {agent.name}: {e}")
    
    def get_simulation_status(self):
        """Get current status of the simulation"""
        status = {
            "game_day": self.game_day,
            "game_time": self.game_time,
            "agents": {}
        }
        
        for name, agent in self.agents.items():
            status["agents"][name] = {
                "role": agent.role,
                "location": agent.location,
                "current_action": agent.current_action,
                "memory_count": len(agent.memory_stream),
                "health": agent.health,
                "energy": agent.energy
            }
        
        return status

# Test function to verify the system works
def test_ai_system():
    """Test the AI agent system"""
    print("🤖 Testing AI Agent System for Fantasy Town")
    
    sim = AgentSimulation()
    
    # Check Ollama connection
    ollama_available = sim.check_ollama_connection()
    
    # Initialize agents
    sim.initialize_agents()
    
    # Show agent status
    status = sim.get_simulation_status()
    print("\n📊 Agent Status:")
    for name, info in status["agents"].items():
        print(f"  {name} ({info['role']}) - {info['memory_count']} memories")
    
    # Test one day simulation
    if ollama_available:
        print("\n🏃 Running one day simulation...")
        sim.simulate_day()
    else:
        print("\n⚠️  Ollama not available - limited AI features")
    
    return sim

if __name__ == "__main__":
    test_ai_system()
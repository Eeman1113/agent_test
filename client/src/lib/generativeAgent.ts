/**
 * Generative Agent Architecture based on the Stanford Research Paper
 * Implements Memory Stream, Reflection, and Planning components
 */

import { Position } from "./stores/useGameState";
import { Pathfinder } from "./pathfinding";

export interface Memory {
  id: string;
  timestamp: string;
  description: string;
  type: 'observation' | 'reflection' | 'plan' | 'conversation';
  importance: number; // 1-10 scale
  relatedAgents: string[];
  location?: Position;
  lastAccessed: number;
}

export interface Plan {
  id: string;
  description: string;
  subplans: string[];
  currentStep: number;
  targetLocation?: Position;
  estimatedDuration: number;
  priority: number;
}

export interface AgentGoal {
  type: 'work' | 'social' | 'personal' | 'exploration';
  description: string;
  priority: number;
  targetLocation?: Position;
  targetAgent?: string;
}

export class GenerativeAgent {
  public id: string;
  public name: string;
  public role: string;
  public description: string;
  public position: Position;
  public targetPosition: Position | null = null;
  public path: Position[] = [];
  public currentPathIndex: number = 0;
  public movementSpeed: number = 2;
  
  // Memory components
  private memoryStream: Memory[] = [];
  private currentPlan: Plan | null = null;
  private dailyGoals: AgentGoal[] = [];
  
  // Agent state
  public energy: number = 100;
  public social: number = 50;
  public hunger: number = 50;
  public lastReflectionTime: number = 0;
  public currentActivity: string = "idle";
  
  // Pathfinding
  private pathfinder: Pathfinder;
  
  constructor(
    id: string, 
    name: string, 
    role: string, 
    description: string, 
    startPosition: Position,
    pathfinder: Pathfinder
  ) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.description = description;
    this.position = startPosition;
    this.pathfinder = pathfinder;
    
    this.initializeAgent();
  }
  
  private initializeAgent(): void {
    // Add initial memory
    this.addMemory(
      `I am ${this.name}, the ${this.role}. ${this.description}`,
      'reflection',
      9,
      []
    );
    
    // Set role-specific goals
    this.initializeRoleGoals();
  }
  
  private initializeRoleGoals(): void {
    const roleGoals: Record<string, AgentGoal[]> = {
      handyman: [
        { type: 'work', description: 'Check and repair buildings', priority: 8, targetLocation: { x: 400, y: 300 } },
        { type: 'social', description: 'Talk to townspeople about repairs needed', priority: 6 }
      ],
      toolsmith: [
        { type: 'work', description: 'Craft tools at the forge', priority: 9, targetLocation: { x: 600, y: 170 } },
        { type: 'social', description: 'Meet with customers about tool orders', priority: 7 }
      ],
      doctor: [
        { type: 'work', description: 'Check on townspeople health', priority: 8 },
        { type: 'work', description: 'Tend to medicine garden', priority: 6, targetLocation: { x: 650, y: 150 } }
      ],
      mayor: [
        { type: 'work', description: 'Plan town improvements', priority: 9, targetLocation: { x: 70, y: 300 } },
        { type: 'social', description: 'Meet with citizens', priority: 8, targetLocation: { x: 400, y: 300 } }
      ],
      farmer: [
        { type: 'work', description: 'Tend to crops', priority: 9, targetLocation: { x: 200, y: 420 } },
        { type: 'work', description: 'Check grain storage', priority: 7, targetLocation: { x: 580, y: 420 } }
      ]
    };
    
    this.dailyGoals = roleGoals[this.role] || [];
  }
  
  /**
   * Add a memory to the agent's memory stream
   */
  public addMemory(description: string, type: Memory['type'], importance: number, relatedAgents: string[], location?: Position): void {
    const memory: Memory = {
      id: `${this.id}_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toISOString(),
      description,
      type,
      importance,
      relatedAgents,
      location: location || this.position,
      lastAccessed: Date.now()
    };
    
    this.memoryStream.push(memory);
    
    // Keep memory stream manageable (last 50 memories)
    if (this.memoryStream.length > 50) {
      this.memoryStream = this.memoryStream.slice(-50);
    }
  }
  
  /**
   * Retrieve relevant memories based on query
   */
  public retrieveMemories(query: string, maxMemories: number = 5): Memory[] {
    const currentTime = Date.now();
    const queryWords = query.toLowerCase().split(' ');
    
    // Score memories based on relevance, recency, and importance
    const scoredMemories = this.memoryStream.map(memory => {
      const memoryWords = memory.description.toLowerCase().split(' ');
      
      // Relevance score (keyword matching)
      let relevance = 0;
      queryWords.forEach(word => {
        if (memoryWords.some(memWord => memWord.includes(word))) {
          relevance += 2;
        }
      });
      
      // Recency score (more recent = higher score)
      const timeDiff = currentTime - memory.lastAccessed;
      const recency = Math.max(0, 10 - (timeDiff / (1000 * 60 * 60))); // Decay over hours
      
      // Importance score (already 1-10)
      const importance = memory.importance;
      
      const totalScore = relevance + recency + importance;
      
      // Update last accessed
      memory.lastAccessed = currentTime;
      
      return { memory, score: totalScore };
    });
    
    // Sort by score and return top memories
    scoredMemories.sort((a, b) => b.score - a.score);
    return scoredMemories.slice(0, maxMemories).map(item => item.memory);
  }
  
  /**
   * Generate reflections based on recent experiences
   */
  public generateReflection(): void {
    const recentMemories = this.memoryStream
      .filter(m => m.type === 'observation' || m.type === 'conversation')
      .slice(-10);
    
    if (recentMemories.length < 3) return;
    
    // Simple reflection generation (in full implementation, would use LLM)
    const themes = this.extractThemes(recentMemories);
    themes.forEach(theme => {
      this.addMemory(
        `Reflection: ${theme}`,
        'reflection',
        7,
        []
      );
    });
    
    this.lastReflectionTime = Date.now();
  }
  
  private extractThemes(memories: Memory[]): string[] {
    const themes: string[] = [];
    
    // Look for patterns in recent memories
    const workMemories = memories.filter(m => m.description.includes('work') || m.description.includes(this.role));
    const socialMemories = memories.filter(m => m.relatedAgents.length > 0);
    
    if (workMemories.length >= 3) {
      themes.push(`I've been very focused on my ${this.role} duties lately`);
    }
    
    if (socialMemories.length >= 2) {
      const agents = Array.from(new Set(socialMemories.flatMap(m => m.relatedAgents)));
      themes.push(`I've been interacting frequently with ${agents.join(', ')}`);
    }
    
    return themes;
  }
  
  /**
   * Plan the agent's next actions
   */
  public planNextAction(): void {
    if (this.currentPlan && this.currentPlan.currentStep < this.currentPlan.subplans.length) {
      return; // Still executing current plan
    }
    
    // Get current context
    const relevantMemories = this.retrieveMemories(`${this.role} work today`, 3);
    const currentGoal = this.selectCurrentGoal();
    
    if (currentGoal) {
      this.createPlanForGoal(currentGoal);
    } else {
      // Default idle behavior
      this.createIdlePlan();
    }
  }
  
  private selectCurrentGoal(): AgentGoal | null {
    // Simple goal selection based on priority and agent state
    const availableGoals = this.dailyGoals.filter(goal => {
      if (goal.type === 'work' && this.energy < 30) return false;
      if (goal.type === 'social' && this.social > 80) return false;
      return true;
    });
    
    if (availableGoals.length === 0) return null;
    
    // Select highest priority goal
    availableGoals.sort((a, b) => b.priority - a.priority);
    return availableGoals[0];
  }
  
  private createPlanForGoal(goal: AgentGoal): void {
    const subplans: string[] = [];
    let targetLocation: Position | undefined;
    
    switch (goal.type) {
      case 'work':
        subplans.push('Prepare for work');
        subplans.push('Travel to work location');
        subplans.push('Perform work tasks');
        subplans.push('Complete work activities');
        targetLocation = goal.targetLocation;
        break;
        
      case 'social':
        subplans.push('Look for people to talk to');
        subplans.push('Approach someone');
        subplans.push('Have a conversation');
        targetLocation = goal.targetLocation || { x: 400, y: 300 }; // Town square
        break;
        
      case 'personal':
        subplans.push('Take care of personal needs');
        subplans.push('Rest if needed');
        break;
        
      case 'exploration':
        subplans.push('Explore the town');
        subplans.push('Observe surroundings');
        break;
    }
    
    this.currentPlan = {
      id: `plan_${Date.now()}`,
      description: goal.description,
      subplans,
      currentStep: 0,
      targetLocation,
      estimatedDuration: 300, // 5 minutes
      priority: goal.priority
    };
    
    this.addMemory(
      `Made plan: ${goal.description}`,
      'plan',
      5,
      []
    );
  }
  
  private createIdlePlan(): void {
    const idleActions = [
      'Look around',
      'Rest briefly',
      'Think about the day'
    ];
    
    this.currentPlan = {
      id: `idle_${Date.now()}`,
      description: 'Taking a break',
      subplans: idleActions,
      currentStep: 0,
      estimatedDuration: 60,
      priority: 1
    };
  }
  
  /**
   * Execute current plan step
   */
  public executeCurrentPlan(): void {
    if (!this.currentPlan) {
      this.planNextAction();
      return;
    }
    
    const currentStep = this.currentPlan.subplans[this.currentPlan.currentStep];
    if (!currentStep) {
      this.currentPlan = null; // Plan completed
      return;
    }
    
    this.currentActivity = currentStep;
    
    // Move toward target if specified
    if (this.currentPlan.targetLocation && !this.isNearTarget(this.currentPlan.targetLocation)) {
      this.moveToTarget(this.currentPlan.targetLocation);
    }
    
    // Advance plan step occasionally
    if (Math.random() < 0.1) {
      this.currentPlan.currentStep++;
      
      if (this.currentPlan.currentStep >= this.currentPlan.subplans.length) {
        this.addMemory(
          `Completed plan: ${this.currentPlan.description}`,
          'observation',
          4,
          []
        );
        this.currentPlan = null;
      }
    }
  }
  
  /**
   * Move agent to target using A* pathfinding
   */
  public moveToTarget(target: Position): void {
    // Only recalculate path if target changed significantly
    if (!this.targetPosition || 
        Math.abs(this.targetPosition.x - target.x) > 20 || 
        Math.abs(this.targetPosition.y - target.y) > 20) {
      
      this.targetPosition = target;
      this.path = this.pathfinder.findPath(this.position.x, this.position.y, target.x, target.y);
      this.path = this.pathfinder.smoothPath(this.path);
      this.currentPathIndex = 0;
    }
    
    // Follow the path
    if (this.path.length > 0 && this.currentPathIndex < this.path.length) {
      const nextPoint = this.path[this.currentPathIndex];
      const dx = nextPoint.x - this.position.x;
      const dy = nextPoint.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 10) {
        // Reached current waypoint, move to next
        this.currentPathIndex++;
      } else {
        // Move toward current waypoint
        const moveX = (dx / distance) * this.movementSpeed;
        const moveY = (dy / distance) * this.movementSpeed;
        
        this.position = {
          x: Math.max(50, Math.min(750, this.position.x + moveX)),
          y: Math.max(150, Math.min(500, this.position.y + moveY))
        };
      }
    }
  }
  
  private isNearTarget(target: Position): boolean {
    const distance = Math.sqrt(
      Math.pow(this.position.x - target.x, 2) + 
      Math.pow(this.position.y - target.y, 2)
    );
    return distance < 30;
  }
  
  /**
   * Update agent state each frame
   */
  public update(): void {
    // Update needs over time
    this.energy = Math.max(0, this.energy - 0.1);
    this.hunger = Math.max(0, this.hunger - 0.05);
    
    // Execute current plan
    this.executeCurrentPlan();
    
    // Generate reflections periodically
    if (Date.now() - this.lastReflectionTime > 300000) { // Every 5 minutes
      this.generateReflection();
    }
    
    // Add occasional observations
    if (Math.random() < 0.02) {
      this.addRandomObservation();
    }
  }
  
  private addRandomObservation(): void {
    const observations = [
      `I notice the weather is pleasant today`,
      `The town square looks busy`,
      `I can hear activity from other buildings`,
      `It's a good day for ${this.role} work`,
      `I should check on my tasks soon`
    ];
    
    const observation = observations[Math.floor(Math.random() * observations.length)];
    this.addMemory(observation, 'observation', 3, []);
  }
  
  /**
   * React to seeing another agent
   */
  public observeAgent(otherAgent: GenerativeAgent): void {
    const distance = Math.sqrt(
      Math.pow(this.position.x - otherAgent.position.x, 2) + 
      Math.pow(this.position.y - otherAgent.position.y, 2)
    );
    
    if (distance < 50) {
      this.addMemory(
        `I saw ${otherAgent.name} at the ${this.getLocationDescription(otherAgent.position)}`,
        'observation',
        4,
        [otherAgent.id]
      );
      
      // Possibility of interaction
      if (Math.random() < 0.1 && this.social < 70) {
        this.initiateConversation(otherAgent);
      }
    }
  }
  
  private getLocationDescription(position: Position): string {
    if (position.x > 320 && position.x < 480 && position.y > 240 && position.y < 360) {
      return "town square";
    } else if (position.y < 200) {
      return "northern area";
    } else if (position.y > 400) {
      return "southern area";
    } else {
      return "town center";
    }
  }
  
  private initiateConversation(otherAgent: GenerativeAgent): void {
    // Generate appropriate emoji communication based on context
    const greetings = [["👋", "😊"], ["🤝", "👍"], ["😊", "❓"]];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    this.addMemory(
      `I greeted ${otherAgent.name} with ${greeting[0]} ${greeting[1]}`,
      'conversation',
      5,
      [otherAgent.id]
    );
    
    // Other agent observes this too
    otherAgent.addMemory(
      `${this.name} greeted me with ${greeting[0]} ${greeting[1]}`,
      'conversation',
      5,
      [this.id]
    );
    
    this.social = Math.min(100, this.social + 5);
  }
  
  public getMemoryCount(): number {
    return this.memoryStream.length;
  }
  
  public getCurrentActivity(): string {
    return this.currentActivity;
  }
  
  public getLastMessage(): { emojis: [string, string]; timestamp: string } | null {
    const lastConversation = this.memoryStream
      .filter(m => m.type === 'conversation')
      .pop();
    
    if (lastConversation && lastConversation.description.includes('greeted')) {
      const emojiMatch = lastConversation.description.match(/([👋🤝😊❓👍]) ([👋🤝😊❓👍])/);
      if (emojiMatch) {
        return {
          emojis: [emojiMatch[1], emojiMatch[2]] as [string, string],
          timestamp: lastConversation.timestamp
        };
      }
    }
    
    return null;
  }
}
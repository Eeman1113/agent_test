# agent_test

This project is a 2D top-down simulation game set in a vibrant village environment. Players control a character to navigate the map and interact with various buildings, each serving a unique function such as a workshop, clinic, farm, or town hall. The village is populated by AI-driven agents, including a handyman, doctor, mayor, and farmer, each with their own predefined roles and daily plans. These agents can perform actions and communicate with each other through emoji messages, adding a layer of dynamic interaction to the game world.

The game is powered by a custom engine that handles rendering using HTML5 Canvas and includes basic collision detection. The client-side is developed with React and TypeScript, utilizing Zustand for efficient state management. On the server-side, Express.js provides the backend framework, while Vite serves as the development environment, ensuring a smooth and modern development workflow.

## Getting Started

### Prerequisites

- Node.js (latest LTS version or higher recommended)

### Installation

- Clone the repository: `git clone <repository-url>`
- Install dependencies: `npm install`

## Running the project

### Development mode

To run the project in development mode, use the following command:

```bash
npm run dev
```

### Building the project

To build the project for production, use the following command:

```bash
npm run build
```

### Production mode

To run the project in production mode, use the following command:

```bash
npm start
```

## Available Scripts

- `npm run dev`: Runs the application in development mode.
- `npm run build`: Builds the application for production.
- `npm start`: Runs the built application in production mode.
- `npm run check`: Performs a TypeScript type check.
- `npm run db:push`: Pushes database schema changes (likely for Drizzle ORM).

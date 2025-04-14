// Simple script to start the Upstox server
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Upstox API server...');

// Spawn the server process
const server = spawn('node', ['upstox-server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
});

// Handle server events
server.on('error', (error) => {
  console.error('Failed to start Upstox server:', error);
});

process.on('SIGINT', () => {
  console.log('Shutting down Upstox server...');
  server.kill('SIGINT');
  process.exit(0);
});

console.log('Server process started. Press Ctrl+C to stop.');

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'run-tests-plugin',
      configureServer(server) {
        server.middlewares.use('/api/run-tests', (req, res) => {
          console.log('Running tests...');
          // Run vitest with json reporters
          exec('npm run test', (error, stdout, stderr) => {
            if (error) console.error('Vitest Error:', error);
            if (stderr) console.error('Vitest Stderr:', stderr);
            try {
              const testResults = JSON.parse(fs.readFileSync(path.resolve('./test-results.json'), 'utf-8'));
              let coverage = null;
              if (fs.existsSync(path.resolve('./coverage/coverage-summary.json'))) {
                coverage = JSON.parse(fs.readFileSync(path.resolve('./coverage/coverage-summary.json'), 'utf-8'));
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ testResults, coverage }));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to read test results' }));
            }
          });
        });
      }
    }
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})

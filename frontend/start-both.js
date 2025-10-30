const { spawn } = require('child_process')
const path = require('path')

console.log('🚀 Starting KellyFlo Connect (Frontend + Backend)...')

// Start backend
const backend = spawn('php', ['artisan', 'serve'], {
  cwd: path.join(__dirname, '../kellyflo-connect/kellyflo-backend'),
  stdio: 'inherit',
  shell: true
})

// Start frontend after a delay
setTimeout(() => {
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  })
}, 3000)
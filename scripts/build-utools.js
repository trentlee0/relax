const path = require('path')
const fs = require('fs')

const files = [
  path.join(__dirname, '../dist', 'favicon.ico'),
  path.join(__dirname, '../dist', 'manifest.json'),
  path.join(__dirname, '../dist', 'robots.txt')
]

files.forEach(file => fs.existsSync(file) && fs.unlinkSync(file))

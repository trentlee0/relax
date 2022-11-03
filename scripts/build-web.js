const path = require('path')
const fs = require('fs')

const files = [
  path.join(__dirname, '../dist', 'plugin.json'),
  path.join(__dirname, '../dist', 'preload.js')
]

files.forEach(file => fs.existsSync(file) && fs.unlinkSync(file))

import ColorThief from 'colorthief'

export function hexToBrightness(hexColor) {
  const hex = hexColor.replace(/#/, '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  return [0.299 * r, 0.587 * g, 0.114 * b].reduce((pre, cur) => pre + cur) / 255
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

export function getSubjectHexColor(src) {
  return new Promise((resolve, reject) => {
    try {
      const colorThief = new ColorThief()
      const imgElement = document.createElement('img')
      imgElement.src = src
      if (imgElement.complete) {
        const rgb = colorThief.getColor(imgElement)
        resolve(rgbToHex(rgb[0], rgb[1], rgb[2]))
      } else {
        imgElement.addEventListener('load', () => {
          const rgb = colorThief.getColor(imgElement)
          resolve(rgbToHex(rgb[0], rgb[1], rgb[2]))
        })
      }
    } catch (err) {
      reject(err)
    }
  })
}

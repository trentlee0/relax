import image from '/public/logo.png'
import {isUTools} from '@/util/common'

export function requestNotificationPermission() {
  if (!isUTools()) {
    if (Notification) {
      if (Notification.permission !== 'granted') {
        Notification.requestPermission()
      }
    } else {
      console.error('浏览器不支持 Notification')
    }
  }
}

/**
 * @param {string} content
 * @param {number} closeTimeout
 */
export function showNotice(content, closeTimeout = undefined) {
  if (isUTools()) {
    utools.showNotification(content, 'relax')
  } else {
    const N = new Notification('Relax', {
      body: content,
      tag: 'relax',
      icon: image,
      requireInteraction: true
    })
    if (closeTimeout) {
      setTimeout(() => N.close(), closeTimeout)
    }
  }
}

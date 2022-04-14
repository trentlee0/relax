import logoImg from '@/assets/logo.png'
import {isUTools} from '@/util/platforms'

export function requestNotificationPermission() {
  if (!isUTools()) {
    if (Notification) {
      if (Notification.permission !== 'granted') {
        Notification.requestPermission()
          .then(permission => {
            if (permission !== 'granted') alert('请允许通知权限！')
          })
      }
    } else {
      console.error('浏览器不支持 Notification')
    }
  }
}

export function showNotice(content, closeTimeout) {
  if (isUTools()) {
    utools.showNotification(content, 'take-a-break')
  } else {
    const N = new Notification('Take A Break', {
      body: content,
      tag: 'tabn',
      icon: logoImg,
      requireInteraction: true
    })
    if (closeTimeout) {
      setTimeout(() => N.close(), closeTimeout)
    }
  }
}

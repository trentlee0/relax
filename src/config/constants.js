/**
 * 计时器状态
 */
export const clockStatus = {
  WORK: 'work',
  REST: 'rest'
}

/**
 * 计时器状态对应的中文
 */
export const clockChinese = {
  work: '专注',
  rest: '休息'
}

/**
 * 背景类型
 */
export const backgroundType = {
  UNSPLASH: 'unsplash',
  SHANBAY: 'shanbay',
  BING: 'bing',
  XIAOWAI: 'xiaowai',
  NETWORK: 'network',
  IMAGE: 'image',
  COLOR: 'color'
}

/**
 * 背景类型对应的中文
 */
export const backgroundChinese = {
  unsplash: 'Unsplash',
  shanbay: '扇贝',
  bing: '必应',
  xiaowai: '高清壁纸',
  network: '网络图片地址',
  image: '本地图片背景',
  color: '自定义颜色背景'
}

export const crossDomainBackground = [
  backgroundType.SHANBAY,
  backgroundType.XIAOWAI
]

/**
 * 引言类型
 */
export const quoteType = {
  HITOKOTO: 'hitokoto',
  SHANBAY: 'shanbay',
  JINRISHICI: 'jinrishici',
  YOUDAO: 'youdao',
  ICIBA: 'iciba',
  ONEYIJU: 'oneyiju',
  CUSTOM: 'custom'
}

/**
 * 引言类型对应的中文
 */
export const quoteChinese = {
  hitokoto: '一言',
  shanbay: '扇贝',
  jinrishici: '今日诗词',
  youdao: '有道',
  iciba: '金山词霸',
  oneyiju: 'ONE一句',
  custom: '自定义'
}

export const crossDomainQuote = [
  quoteType.SHANBAY,
  quoteType.YOUDAO,
  quoteType.ICIBA
]

/**
 * uTools 插件的 Feature
 */
export const uToolsFeatureCodes = {
  Home: 'relax',
  Work: 'start-work',
  Rest: 'start-rest',
  StopOrContinue: 'stop-continue-clock'
}

/**
 * 数据库中的键值对中的建
 */
export const dataKey = {
  Background: 'background',
  Quote: 'quote',
  WorkingTime: 'workingTime',
  RestingTime: 'restingTime',
  Notification: 'notification',
  Statistics: 'statistics',
  BackgroundMusic: 'backgroundMusic',
  Todo: 'todo',
  AutomaticTiming: 'automaticTiming'
}

/**
 * 默认设置
 */
export const defaultSettings = {
  background: {
    type: backgroundType.BING,
    val: ''
  },
  quote: {
    type: quoteType.JINRISHICI,
    val: ''
  },
  workingTime: 45 * 60,
  restingTime: 5 * 60,
  notification: {
    whenEndOfWorkingTime: true,
    beforeEndOfWorkingTime: false,
    whenEndOfRestingTime: true,
    showWindowWhenEndOfWorkingTime: false
  },
  automaticTiming: {
    working: false,
    resting: false
  },
  backgroundMusic: {
    selected: 'none',
    volume: 0.5
  }
}

/**
 * 计时器状态
 */
export class ClockStatus {
  static WORK = 'work'
  static REST = 'rest'
}

/**
 * 背景类型
 */
export class BackgroundType {
  static UNSPLASH = 'unsplash'
  static SHANBAY = 'shanbay'
  static BING = 'bing'
  static XIAOWAI = 'xiaowai'
  static NETWORK = 'network'
  static IMAGE = 'image'
  static COLOR = 'color'
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
  BackgroundType.SHANBAY,
  BackgroundType.XIAOWAI
]

/**
 * 引言类型
 */
export class QuoteType {
  static HITOKOTO = 'hitokoto'
  static SHANBAY = 'shanbay'
  static JINRISHICI = 'jinrishici'
  static YOUDAO = 'youdao'
  static ICIBA = 'iciba'
  static ONEYIJU = 'oneyiju'
  static CUSTOM = 'custom'
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
  QuoteType.SHANBAY,
  QuoteType.YOUDAO,
  QuoteType.ICIBA
]

export class FocusEfficiency {
  static TERRIBLE = 'terrible'
  static ORDINARY = 'ordinary'
  static GOOD = 'good'
  static WONDERFUL = 'wonderful'
}

export const focusEfficiencyChinese = {
  terrible: '心不在焉',
  ordinary: '一心一意',
  good: '专心致志',
  wonderful: '心如止水'
}

/**
 * uTools 插件的 Feature
 */
export class UToolsCodes {
  static Relax = 'relax'
  static Work = 'start-work'
  static Rest = 'start-rest'
  static StopOrContinue = 'stop-continue-clock'
}

/**
 * 数据库中的键值对中的建
 */
export class DataKey {
  static Settings = 'settings'

  static Background = 'background'
  static Quote = 'quote'
  static WorkingTime = 'workingTime'
  static RestingTime = 'restingTime'
  static Notification = 'notification'
  static Statistics = 'statistics'
  static BackgroundMusic = 'backgroundMusic'
  static Todo = 'todo'
  static AutomaticTiming = 'automaticTiming'

  static Visited = 'visited'
}

/**
 * 默认设置
 */
export class Settings {
  static DEFAULT = new Settings()

  version = 1

  background = {
    type: BackgroundType.BING,
    val: ''
  }

  quote = {
    type: QuoteType.JINRISHICI,
    val: ''
  }

  workingTime = 45 * 60
  restingTime = 5 * 60

  notification = {
    whenEndOfWorkingTime: true,
    beforeEndOfWorkingTime: false,
    whenEndOfRestingTime: true,
    showWindowWhenEndOfWorkingTime: false
  }

  automaticTiming = {
    working: false,
    resting: false
  }

  backgroundMusic = {
    selected: 'none',
    volume: 0.5
  }

  general = {
    enableFocusEfficiency: false
  }
}

import Vue from 'vue'
import Vuex from 'vuex'
import {BackgroundType, DataKey, Settings, QuoteType} from '@/common/constant'
import settingsStore from '@/api/settings'
import {deepCopy, isUTools} from '@/util/common'

Vue.use(Vuex)

const state = {settings: {}}

function migrate() {
  const settings = settingsStore.getSync('settings')
  if (!settings) {
    state.settings = {
      version: 1,
      background: settingsStore.getSync(DataKey.Background) || deepCopy(Settings.DEFAULT.background),
      quote: settingsStore.getSync(DataKey.Quote) || deepCopy(Settings.DEFAULT.quote),
      workingTime: settingsStore.getSync(DataKey.WorkingTime) || deepCopy(Settings.DEFAULT.workingTime),
      restingTime: settingsStore.getSync(DataKey.RestingTime) || deepCopy(Settings.DEFAULT.restingTime),
      notification: settingsStore.getSync(DataKey.Notification) || deepCopy(Settings.DEFAULT.notification),
      automaticTiming: settingsStore.getSync(DataKey.AutomaticTiming) || deepCopy(Settings.DEFAULT.automaticTiming),
      backgroundMusic: settingsStore.getSync(DataKey.BackgroundMusic) || deepCopy(Settings.DEFAULT.backgroundMusic),
      general: deepCopy(Settings.DEFAULT.general)
    }
    settingsStore.setSync(DataKey.Settings, deepCopy(state.settings))

    settingsStore.removeSync(DataKey.Background)
    settingsStore.removeSync(DataKey.Quote)
    settingsStore.removeSync(DataKey.Notification)
    settingsStore.removeSync(DataKey.WorkingTime)
    settingsStore.removeSync(DataKey.RestingTime)
    settingsStore.removeSync(DataKey.BackgroundMusic)
    settingsStore.removeSync(DataKey.AutomaticTiming)
  } else {
    if (!settings.version) settings.version = 1
    if (!settings.general) settings.general = deepCopy(Settings.DEFAULT.general)
    state.settings = settings
  }
}

migrate()

export default new Vuex.Store({
  state,
  mutations: {
    UPDATE_BACKGROUND(state, [type, val]) {
      if (state.settings.background.type === type) return
      settingsStore.clearTempCache()
      state.settings.background.type = type
      // 仅仅用户自定义图片/网络图片/颜色背景才需要保存
      if (val) {
        if (type === BackgroundType.COLOR || type === BackgroundType.NETWORK) state.settings.background.val = val
        else if (type === BackgroundType.IMAGE) {
          if (isUTools()) state.settings.background.val = val
          else settingsStore.setTempCache(type, val)
        } else state.settings.background.val = ''
      }
      settingsStore.setSync(DataKey.Settings, deepCopy(state.settings))
    },
    UPDATE_QUOTE(state, [type, val]) {
      state.settings.quote.type = type
      if (val && type === QuoteType.CUSTOM) state.settings.quote.val = val
      else state.settings.quote.val = ''
      settingsStore.setSync(DataKey.Settings, deepCopy(state.settings))
    },
    SET_NOTIFICATION(state, notification) {
      state.settings.notification = notification
      settingsStore.setSync(DataKey.Settings, deepCopy(state.settings))
    },
    SET_WORKING_TIME(state, workingTime) {
      state.settings.workingTime = workingTime
      settingsStore.setSync(DataKey.Settings, deepCopy(state.settings))
    },
    SET_RESTING_TIME(state, restingTime) {
      state.settings.restingTime = restingTime
      settingsStore.setSync(DataKey.Settings, deepCopy(state.settings))
    },
    SET_ALL(state, newState) {
      state.settings = newState
      settingsStore.setSync(DataKey.Settings, deepCopy(state.settings))
    },
    RESET(state) {
      state.settings = new Settings()
      settingsStore.removeSync(DataKey.Settings)
    },
    SET_BACKGROUND_MUSIC(state, [selected, volume]) {
      state.settings.backgroundMusic.selected = selected
      state.settings.backgroundMusic.volume = volume
      settingsStore.setSync(DataKey.Settings, deepCopy(state.settings))
    },
    SET_AUTOMATIC_TIMING(state, automaticTiming) {
      state.settings.automaticTiming = automaticTiming
      settingsStore.setSync(DataKey.Settings, deepCopy(state.settings))
    },
    SET_FOCUS_EFFICIENCY(state, enableFocusEfficiency) {
      if (state.settings.general) {
        state.settings.general.enableFocusEfficiency = enableFocusEfficiency
      } else {
        state.settings.general = {enableFocusEfficiency}
      }
      settingsStore.setSync(DataKey.Settings, deepCopy(state.settings))
    }
  }
})

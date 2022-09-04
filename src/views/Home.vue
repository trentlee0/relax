<template>
  <div id="home-page">
    <v-img
      class="background-img"
      :style="{backgroundColor: bgColor}"
      :src="bgImage"
    ></v-img>

    <div class="toolbar">
      <v-btn
        icon
        fab
        :dark="isDarkStyle"
        :light="!isDarkStyle"
        class="dashboard-btn"
        :title="`统计 (${shortcuts.global.STATISTIC})`"
        @click="$router.push('/statistic')"
      >
        <MyIcon>mdi-chart-box-outline</MyIcon>
      </v-btn>

      <v-btn
        icon
        fab
        :dark="isDarkStyle"
        :light="!isDarkStyle"
        class="setting-btn"
        @click="$router.push('/setting')"
        :title="`设置 (${shortcuts.global.SETTING})`"
      >
        <MyIcon>mdi-cog-outline</MyIcon>
      </v-btn>

      <v-btn
        icon
        fab
        class="audio-btn"
        :dark="isDarkStyle"
        :light="!isDarkStyle"
        @click.native="audioPanel = true"
        :title="`背景音 (${shortcuts.home.BACKGROUND_MUSIC})`"
      >
        <MyIcon v-show="volumeMode === 'volumeOff'">mdi-volume-off</MyIcon>
        <MyIcon v-show="volumeMode === 'volumeMute'">mdi-volume-mute</MyIcon>
        <MyIcon v-show="volumeMode === 'volumeHigh'">mdi-volume-high</MyIcon>
      </v-btn>

      <v-btn
        :dark="isDarkStyle"
        :light="!isDarkStyle"
        icon
        fab
        class="todo-btn"
        @click="showDrawer"
        :title="`待办事项 (${shortcuts.home.TODO})`"
      >
        <MyIcon>mdi-format-list-checks</MyIcon>
      </v-btn>
    </div>

    <AudioPanel
      :isShow="audioPanel"
      :dark="isDarkStyle"
      @close="closeAudioPanelEvent"
      @volumeChange="volumeChangeEvent"
    >
    </AudioPanel>

    <v-navigation-drawer
      v-model="drawer"
      width="360"
      absolute
      right
      temporary
    >
      <TodoPanel></TodoPanel>
      <Dialog
        title="当前正在计时，是否切换到新任务？"
        :show="dialog.switchTaskDialog"
        @confirm="switchTask"
        @cancel="dialog.switchTaskDialog = false"
      >
      </Dialog>
    </v-navigation-drawer>

    <div id="main">
      <div class="container" :style="{minHeight: progressContainer + 'px'}">
        <div class="quote-div" :style="{marginBottom: quoteMarginBottom + 'px'}">
          <div
            class="quote-content-div"
            :class="fontColorClass"
            v-show="quoteText"
          >
            「 {{ quoteText }} 」
          </div>
        </div>

        <div class="timer-div">
          <v-progress-circular
            rotate="-90"
            width="9"
            :size="progressSize"
            :value="progress"
            :color="isDarkStyle ? '#E4EAF0' : '#6C6C6C'"
          >
            <div class="tick-time-div">
              <div>
                <MyIcon
                  :dark="isDarkStyle"
                  :light="!isDarkStyle"
                  v-show="!isPause && isWorkingTime"
                  title="专注中"
                >
                  mdi-laptop
                </MyIcon>
                <MyIcon
                  :dark="isDarkStyle"
                  :light="!isDarkStyle"
                  v-show="!isPause && !isWorkingTime"
                  title="休息中"
                >
                  mdi-coffee-outline
                </MyIcon>
                <MyIcon
                  :dark="isDarkStyle"
                  :light="!isDarkStyle"
                  v-show="isPause"
                  title="暂停中"
                >
                  mdi-timer-pause-outline
                </MyIcon>
              </div>

              <div class="tick" :class="fontColorClass">
                {{ tickTimeText }}
              </div>

              <div :class="fontColorClass">
                <span v-show="isPlaying">在 </span>
                <span style="font-weight: bold;">{{ showTip }}</span>
                <span v-show="isPlaying"> 中</span>
              </div>
            </div>
          </v-progress-circular>
        </div>

        <div class="btn-group">
          <v-btn
            icon
            fab
            :dark="isDarkStyle"
            :light="!isDarkStyle"
            :title="`切换计时器 (${shortcuts.home.CHANGE_TIMER})`"
            @click.stop="handleSwitchClick"
          >
            <MyIcon>mdi-rotate-3d-variant</MyIcon>
          </v-btn>
          <v-btn
            icon
            fab
            large
            :dark="isDarkStyle"
            :light="!isDarkStyle"
            :title="`开始计时 (${shortcuts.home.START_TIMER})`"
            @click.stop="startTimer"
          >
            <MyIcon v-show="isPlaying">mdi-pause-circle</MyIcon>
            <MyIcon v-show="!isPlaying">mdi-arrow-right-drop-circle</MyIcon>
          </v-btn>
          <v-btn
            icon
            fab
            :dark="isDarkStyle"
            :light="!isDarkStyle"
            :title="`结束计时 (${shortcuts.home.END_TIMER})`"
            @click.stop="handleRestoreClick"
          >
            <MyIcon>mdi-crop-square</MyIcon>
          </v-btn>
        </div>
      </div>
    </div>

    <Dialog
      title="评价一下本次专注吧"
      :show="dialog.obtainFocusResultDialog"
      :cancelable="false"
      confirm-text="好"
      @confirm="handleObtainFocusResult"
    >
      <v-card-text>
        <v-radio-group
          v-model="focusResult"
          mandatory
          column
        >
          <v-radio
            v-for="item in focusEfficiency"
            :value="item[0]"
            :label="item[1]"
          ></v-radio>
        </v-radio-group>
      </v-card-text>
    </Dialog>

    <Dialog
      :title="'当前正在' + statusText + '中，是否切换计时器？'"
      :show="dialog.switchClockDialog"
      @confirm="switchTimer"
      @cancel="dialog.switchClockDialog = false"
    >
    </Dialog>

    <Dialog
      title="是否结束计时？"
      :show="dialog.restoreDialog"
      @confirm="restoreTimer"
      @cancel="dialog.restoreDialog = false"
    >
    </Dialog>

    <Dialog
      :title="`是否添加任务${tempTask ? '「' + tempTask.title + '」' : ''}并开始计时？`"
      :show="dialog.addTaskConfirmDialog"
      @confirm="addTaskHandle"
      @cancel="dialog.addTaskConfirmDialog = false"
    >
    </Dialog>

    <v-snackbar
      v-model="snack.show"
      :timeout="2000"
      min-width="100"
    >
      <strong class="pl-2"> {{ snack.msg }}</strong>
    </v-snackbar>
  </div>
</template>

<script>
import Timer from 'timer.js'
import {getQuoteByName} from '@/api/quote'
import {formatDurationSeconds} from '@/util/date'
import {requestNotificationPermission, showNotice} from '@/util/notification'
import {
  BackgroundType,
  ClockStatus,
  UToolsFeatureCodes,
  FocusEfficiency,
  focusEfficiencyChinese
} from '@/common/constant'
import settings from '@/api/settings'
import {getImageByName} from '@/api/image'
import statistics from '@/api/statistics'
import Dialog from '@/components/Dialog'
import AudioPanel from '@/views/home/audio/AudioPanel'
import dayjs from 'dayjs'
import {isUTools} from '@/util/common'
import {mapState} from 'vuex'
import {getSubjectHexColor, hexToBrightness} from '@/util/color'
import TodoPanel from '@/views/home/todo/TodoPanel'
import MyIcon from '@/components/MyIcon'
import todos from '@/api/todos'
import hotkeys from 'hotkeys-js'
import shortcuts from '@/common/shortcuts'


export default {
  name: 'Home',
  components: {MyIcon, TodoPanel, Dialog, AudioPanel},
  data() {
    return {
      timer: {},
      tick: 0,
      isPlaying: false,
      isPause: false,
      // 0 表示专注，1 表示休息
      status: 0,
      progress: 100,
      // 记录开始计时时间戳
      startTimestamp: 0,
      // 切换计时器延迟
      resetTimeout: 500,
      notifyBeforeEndOfTime: 15,
      backgroundImage: '',
      quoteText: '',
      taskName: '',
      tempTask: null,
      drawer: false,
      audioPanel: false,
      dialog: {
        restoreDialog: false,
        switchClockDialog: false,
        switchTaskDialog: false,
        addTaskConfirmDialog: false,
        obtainFocusResultDialog: false
      },
      snack: {
        show: false,
        timeout: 2000,
        msg: ''
      },
      isSwitchAndStartTimer: false,
      isDarkStyle: true,
      // 'volumeOff' | 'volumeMute' | 'volumeHigh'
      volumeMode: 'volumeOff',
      shortcuts: shortcuts,
      focusResult: FocusEfficiency.ORDINARY,
      focusEfficiency: Object.entries(focusEfficiencyChinese),
      focusDuration: 0
    }
  },
  computed: {
    ...mapState({
      background: state => state.settings.background,
      quote: state => state.settings.quote,
      workingTime: state => state.settings.workingTime,
      restingTime: state => state.settings.restingTime,
      notification: state => state.settings.notification,
      automaticTiming: state => state.settings.automaticTiming,
      enableFocusEfficiency: state => state.settings.general && state.settings.general.enableFocusEfficiency
    }),
    progressSize() {
      if (isUTools()) return 290
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return 260
        case 'sm':
          return 300
        default:
          return 320
      }
    },
    progressContainer() {
      if (isUTools()) return 475
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return 300
        case 'sm':
          return 450
        default:
          return 500
      }
    },
    fontColorClass() {
      return this.isDarkStyle ? 'font-dark' : 'font-light'
    },
    bgColor() {
      return this.background.type === BackgroundType.COLOR ? this.background.val : ''
    },
    bgImage() {
      return this.background.type !== BackgroundType.COLOR ? this.backgroundImage : ''
    },
    quoteMarginBottom() {
      if (isUTools()) return 10
      return this.$vuetify.breakpoint.name === 'xs' ? 32 : 10
    },
    ratio() {
      return 100 / this.totalTime
    },
    tickTimeText() {
      return formatDurationSeconds(this.tick)
    },
    totalTime() {
      return this.status ? this.restingTime : this.workingTime
    },
    showTip() {
      return this.isWorkingTime && this.taskName ? this.taskName : this.statusText
    },
    isWorkingTime() {
      return this.status === 0
    },
    isRestingTime() {
      return this.status === 1
    },
    statusText() {
      return this.status ? '休息' : '专注'
    },
    currentStatus() {
      return this.status ? ClockStatus.REST : ClockStatus.WORK
    },
    isClocking() {
      return this.isPlaying || this.isPause
    }
  },
  created() {
    requestNotificationPermission()
    this.getImage()
    this.getQuote()

    hotkeys(Object.values(shortcuts.home).join(','), 'home', (event, handler) => {
      event.preventDefault()
      switch (handler.key) {
        case this.shortcuts.home.CHANGE_TIMER:
          this.handleSwitchClick()
          break
        case this.shortcuts.home.START_TIMER:
          this.startTimer()
          break
        case this.shortcuts.home.END_TIMER:
          this.handleRestoreClick()
          break
        case this.shortcuts.home.TODO:
          this.audioPanel = false
          this.drawer = !this.drawer
          break
        case this.shortcuts.home.BACKGROUND_MUSIC:
          this.drawer = false
          this.audioPanel = !this.audioPanel
          break
      }
    })
  },
  activated() {
    hotkeys.setScope('home')

    if (!this.isClocking) {
      this.initPage()
    }
  },
  deactivated() {
  },
  beforeDestroy() {
    this.timer.stop()
    this.$bus.$off('startTimer')
    this.$bus.$emit('stopAudio')
  },
  methods: {
    initPage() {
      window.document.documentElement.style.overflowY = 'hidden'

      const that = this
      this.tick = this.totalTime
      this.timer = new Timer({
        tick: 1,
        ontick(ms) {
          if (ms < 0) {
            this.onend()
          }
          let s = Math.round(ms / 1000)
          that.tick = s
          that.progress = s * that.ratio
          if (that.status === 0 && that.notification.beforeEndOfWorkingTime &&
            that.tick === that.notifyBeforeEndOfTime) {
            showNotice('准备休息啦', 5000)
          }
        },
        onstart() {
          that.isPlaying = true
          that.isPause = false
          if (that.isWorkingTime) that.playBackgroundMusic()
        },
        onpause() {
          that.isPlaying = false
          that.isPause = true
          if (that.isWorkingTime) that.pauseBackgroundMusic()
        },
        onstop() {
          if (that.isWorkingTime) that.pauseBackgroundMusic()

          that.tick = that.totalTime
          that.progress = 100
          that.isPlaying = false
          that.isPause = false
        },
        onend() {
          if (that.isWorkingTime) that.pauseBackgroundMusic()

          if (that.isWorkingTime) {
            that.notification.whenEndOfWorkingTime && showNotice('专注结束了，休息一下吧')
            isUTools() && that.notification.showWindowWhenEndOfWorkingTime && that.showUToolsMainWindow()
          } else if (that.isRestingTime) {
            that.notification.whenEndOfRestingTime && showNotice('休息结束啦')
          }
          that.tick = 0
          that.progress = 0
          that.isPlaying = false

          // 打开记录专注效率对话框
          if (that.enableFocusEfficiency && that.isWorkingTime) {
            that.focusDuration = that.totalTime / 60
            that.dialog.obtainFocusResultDialog = true
          } else {
            statistics.add(that.showTip, that.totalTime / 60, that.currentStatus, that.startTimestamp, Date.now(), false)
            that.switchAndStartClock()
          }
        }
      })

      if (isUTools()) {
        this.uToolsMode()
      }

      this.$bus.$on('startTaskTimer', this.startTaskTimer)
    },
    showUToolsMainWindow() {
      utools.redirect('休息一下', null)
      let isShow = false
      const timeouts = [0, 50, 50, 100, 300, 500]
      let index = 0
      const attempt = () => {
        if (isShow || index === timeouts.length) return
        setTimeout(() => {
          isShow = utools.showMainWindow()
          attempt()
        }, timeouts[index++])
      }
      attempt()
    },
    closeAudioPanelEvent() {
      this.audioPanel = false
      this.$nextTick(() => {
        document.querySelector('.audio-btn').blur()
      })
    },
    showDrawer() {
      this.$bus.$emit('toTodoPanel')
      this.drawer = true
    },
    startTaskTimer(task) {
      this.tempTask = task
      if (this.isWorkingTime && this.isClocking) {
        if (this.taskName === task.title) {
          this.snackbar('正在专注中')
        } else {
          this.dialog.switchTaskDialog = true
        }
      } else {
        this.switchTask()
      }
    },
    addTaskHandle() {
      const task = {id: Date.now(), done: false, title: this.tempTask.title}
      this.startTaskTimer(task)
      todos.addFirst(task)
      this.dialog.addTaskConfirmDialog = false
    },
    volumeChangeEvent({mode}) {
      this.volumeMode = mode
    },
    getImage() {
      if (this.bgColor) {
        this.changeStyleColor(this.bgColor)
        return
      }
      const currentType = this.background.type
      settings.getTempCache(currentType).then(res => {
        const today = dayjs().format('YYYYMMDD')
        if (!res.data || !res.data['image'] || res.data['updateTime'] !== today) {
          getImageByName(currentType).then(data => {
            // 图片缓存
            settings.setTempCache(currentType, {image: data, updateTime: today}).then(() => {
              this.backgroundImage = data
              getSubjectHexColor(data).then(res => this.changeStyleColor(res))
            })
          })
          return
        }
        this.backgroundImage = res.data['image']
        getSubjectHexColor(res.data).then(res => this.changeStyleColor(res))
      })
    },
    getQuote() {
      getQuoteByName(this.quote.type).then(data => this.quoteText = data['content'])
    },
    changeStyleColor(bgHexColor) {
      this.isDarkStyle = hexToBrightness(bgHexColor) <= 0.8
    },
    playBackgroundMusic() {
      this.$bus.$emit('playAudio')
    },
    pauseBackgroundMusic() {
      this.$bus.$emit('pauseAudio')
    },
    switchMuteBackgroundMusic() {
      this.$bus.$emit('switchMute')
    },
    handleSwitchClick() {
      if (this.isClocking) {
        this.dialog.switchClockDialog = !this.dialog.switchClockDialog
      } else {
        this.switchClock()
      }
    },
    handleRestoreClick() {
      if (this.isClocking) {
        this.dialog.restoreDialog = !this.dialog.restoreDialog
      } else {
        this.taskName = ''
      }
    },
    startTimer() {
      if (this.isPlaying) {
        this.timer.pause()
      } else {
        if (this.tick === this.totalTime) {
          this.startTimestamp = Date.now()
        }
        this.timer.start(this.tick)
      }
    },
    switchToWork() {
      this.status = 0
      this.tick = this.totalTime
    },
    switchClock() {
      this.progress = 100
      this.status = (this.status + 1) % 2
      this.tick = this.totalTime
    },
    switchAndStartClock() {
      this.switchClock()

      setTimeout(() => {
        this.tick = this.totalTime
        this.progress = 100

        if (this.automaticTiming.working && this.isWorkingTime) {
          this.startTimer()
        }
        if (this.automaticTiming.resting && this.isRestingTime) {
          this.startTimer()
        }
      }, this.resetTimeout)
    },
    switchToRest() {
      this.status = 1
      this.tick = this.totalTime
    },
    switchTimer() {
      this.timer.stop()
      this.dialog.switchClockDialog = false
      setTimeout(() => {
        this.switchClock()
        if (this.isSwitchAndStartTimer) {
          this.startTimer()
          this.isSwitchAndStartTimer = false
        }
      }, 100)
    },
    switchTask() {
      const title = this.tempTask.title
      this.timer.stop()
      this.switchToWork()
      this.startTimer()
      this.taskName = title
      this.tempTask = null
      this.dialog.switchTaskDialog = false
    },
    restoreTimer() {
      let duration = Math.floor((this.totalTime - this.tick) / 60)
      if (duration >= 1) {
        console.log('save')
        // 打开记录专注效率对话框
        if (this.enableFocusEfficiency && this.isWorkingTime) {
          this.focusDuration = duration
          this.dialog.obtainFocusResultDialog = true
        } else {
          statistics.add(this.showTip, duration, this.currentStatus, this.startTimestamp, Date.now(), false)
        }
      }

      this.timer.stop()
      this.dialog.restoreDialog = false
      this.taskName = ''
    },
    handleObtainFocusResult() {
      this.dialog.obtainFocusResultDialog = false
      statistics.add(
        this.showTip,
        this.focusDuration,
        this.currentStatus,
        this.startTimestamp,
        Date.now(),
        true,
        this.focusResult
      )
      this.switchAndStartClock()
      this.focusResult = FocusEfficiency.ORDINARY
    },
    snackbar(msg) {
      this.snack.show = true
      this.snack.msg = msg
    },
    uToolsMode() {
      utools.onPluginEnter(({code, type, payload}) => {
        switch (code) {
          case UToolsFeatureCodes.Work:
            if (type === 'over') {
              const title = payload.trim()
              todos.getByTaskName(title).then(({data}) => {
                if (data) {
                  this.startTaskTimer(data)
                } else {
                  this.tempTask = {title}
                  this.dialog.addTaskConfirmDialog = true
                }
              })
            } else {
              if (!this.isClocking) {
                this.switchToWork()
                this.startTimer()
              } else if (this.isRestingTime) {
                this.dialog.switchClockDialog = true
                this.isSwitchAndStartTimer = true
              }
            }
            break
          case UToolsFeatureCodes.Rest:
            if (!this.isClocking) {
              this.switchToRest()
              this.startTimer()
            } else if (this.isWorkingTime) {
              this.dialog.switchClockDialog = true
              this.isSwitchAndStartTimer = true
            }
            break
          case UToolsFeatureCodes.StopOrContinue:
            if (this.tick !== this.totalTime) this.startTimer()
            break
        }
      })

      utools.onPluginOut(() => {
        this.getImage()
        this.getQuote()
      })
    }
  }
}
</script>

<style lang="sass" scoped>
$colorOnDark: #fafbfc
$colorOnLight: #6C6C6C

.font-dark
  color: $colorOnDark

.font-light
  color: $colorOnLight

#home-page
  position: absolute
  width: 100%
  height: 100%
  z-index: 0

.background-img
  width: 100%
  height: 100%
  position: absolute
  background-color: #616161
  z-index: -10

.toolbar
  position: fixed

  .dashboard-btn
    position: fixed
    top: 2px
    left: 2px

  .audio-btn
    position: fixed
    bottom: 2px
    left: 2px

  .setting-btn
    position: fixed
    top: 2px
    right: 2px

  .todo-btn
    position: fixed
    bottom: 2px
    right: 2px


#main
  width: 100%
  height: 100%
  display: flex
  justify-items: center
  align-items: center

  .container
    display: flex
    flex-direction: column
    justify-content: space-between
    align-items: center
    color: white

    .quote-div
      height: 30px
      color: white
      text-align: center
      margin: 10px 45px
      line-height: 26px
      font-size: large

    .timer-div

      .tick-time-div
        color: white
        text-align: center

      .tick
        font-size: 50px
        font-weight: bold


    .btn-group
      width: 200px
      display: flex
      justify-content: space-between
</style>

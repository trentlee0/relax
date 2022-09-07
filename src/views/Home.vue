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
        <MyIcon v-show="volumeMode === 'volumeLow'">mdi-volume-low</MyIcon>
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
      :volume-status.sync="volumeMode"
      @close="closeAudioPanelEvent"
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
        :show.sync="dialog.turnToTaskDialog"
        @confirm="turnToTaskTimer"
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
      :show.sync="dialog.switchClockDialog"
      @confirm="handleSwitchTimer"
    >
    </Dialog>

    <Dialog
      title="是否结束计时？"
      :show.sync="dialog.restoreDialog"
      @confirm="handleRestoreTimer"
    >
    </Dialog>

    <Dialog
      :title="`是否添加任务${tempTask ? '「' + tempTask.title + '」' : ''}并开始计时？`"
      :show.sync="dialog.addTaskConfirmDialog"
      @confirm="handleAddTask"
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
import {getSubjectColor, hexToBrightness} from '@/util/color'
import TodoPanel from '@/views/home/todo/TodoPanel'
import MyIcon from '@/components/MyIcon'
import todos, {Task} from '@/api/todos'
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
      isCompleted: false,
      // 0 表示专注，1 表示休息
      status: 0,
      progress: 100,
      // 记录开始计时时间戳
      startTimestamp: 0,
      // 切换计时器延迟
      resetTimeout: 500,
      notifyWorkedEarlierTime: 15,
      backgroundImage: '',
      quoteText: '',
      // 当前专注任务名
      taskName: '',
      // 切换任务专注任务时临时保存任务信息
      tempTask: null,
      drawer: false,
      audioPanel: false,
      dialog: {
        restoreDialog: false,
        switchClockDialog: false,
        turnToTaskDialog: false,
        addTaskConfirmDialog: false,
        obtainFocusResultDialog: false
      },
      snack: {
        show: false,
        timeout: 2000,
        msg: ''
      },
      notifyText: {
        workedText: '专注结束了，休息一下吧',
        restedText: '休息结束啦',
        readyToRestText: '准备休息啦'
      },
      // 用于标记 uTools 进入是否切换并且开始计时器
      isSwitchAndStartTimer: false,
      isDarkStyle: true,
      // 'volumeOff' | 'volumeMute' | 'volumeHigh' | 'volumeLow'
      volumeMode: 'volumeOff',
      shortcuts: shortcuts,
      focusResult: FocusEfficiency.ORDINARY,
      focusEfficiency: Object.entries(focusEfficiencyChinese),
      focusDuration: 0,
      focusTaskName: ''
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
    if (!this.isClocking) {
      this.initPage()
    }
  },
  beforeDestroy() {
    this.timer.stop()
    this.$bus.$off('start-task-timer')
    this.$bus.$emit('stop-audio')
  },
  methods: {
    initPage() {
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
          if (that.tick === that.notifyWorkedEarlierTime && that.notification.beforeEndOfWorkingTime) {
            that.isWorkingTime && showNotice(that.notifyText.readyToRestText, 5000)
          }
        },
        onstart() {
          that.isPlaying = true
          that.isPause = false
          that.isCompleted = false

          if (that.isWorkingTime) that.playBackgroundMusic()
        },
        onpause() {
          that.isPlaying = false
          that.isPause = true

          if (that.isWorkingTime) that.pauseBackgroundMusic()
        },
        onstop() {
          that.isPlaying = false
          that.isPause = false

          that.tick = that.totalTime
          that.progress = 100

          if (that.isWorkingTime) that.pauseBackgroundMusic()
        },
        onend() {
          that.isPlaying = false
          that.isPause = false
          that.isCompleted = true

          that.tick = 0
          that.progress = 0

          if (that.isWorkingTime) {
            that.pauseBackgroundMusic()
            that.notification.whenEndOfWorkingTime && showNotice(that.notifyText.workedText)
            isUTools() && that.notification.showWindowWhenEndOfWorkingTime && that.showUToolsMainWindow()
          } else {
            that.notification.whenEndOfRestingTime && showNotice(that.notifyText.restedText)
          }

          // 打开记录专注效率对话框
          if (that.enableFocusEfficiency && that.isWorkingTime) {
            that.focusTaskName = that.showTip
            that.focusDuration = that.totalTime / 60
            that.dialog.obtainFocusResultDialog = true
          } else {
            statistics.add(that.showTip, that.totalTime / 60, that.currentStatus, that.startTimestamp, Date.now(), false)
            that.changeTimer()
          }
        }
      })

      if (isUTools()) {
        this.uToolsMode()
      }

      this.$bus.$on('start-task-timer', this.startTaskTimer)
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
      this.$bus.$emit('open-todo-panel')
      this.drawer = true
    },
    handleAddTask() {
      const task = new Task(this.tempTask.title)
      this.startTaskTimer(task)
      todos.addFirst(task)
      this.dialog.addTaskConfirmDialog = false
    },
    getImage() {
      if (this.bgColor) {
        this.changeStyleColor(this.bgColor)
        return
      }
      const currentType = this.background.type
      settings.getTempCache(currentType).then(({data}) => {
        const today = dayjs().format('YYYYMMDD')
        if (!data || !data['image'] || data['updateTime'] !== today) {
          getImageByName(currentType).then(image => {
            // 图片缓存
            settings.setTempCache(currentType, {image, updateTime: today}).then(() => {
              this.backgroundImage = image
              getSubjectColor(image).then(res => this.changeStyleColor(res))
            })
          })
          return
        }
        this.backgroundImage = data['image']
        getSubjectColor(data).then(res => this.changeStyleColor(res))
      })
    },
    getQuote() {
      getQuoteByName(this.quote.type).then(data => this.quoteText = data.content)
    },
    changeStyleColor(bgHexColor) {
      this.isDarkStyle = hexToBrightness(bgHexColor) <= 0.8
    },
    playBackgroundMusic() {
      this.$bus.$emit('play-audio')
    },
    pauseBackgroundMusic() {
      this.$bus.$emit('pause-audio')
    },
    switchMuteBackgroundMusic() {
      this.$bus.$emit('turn-on-mute')
    },
    handleSwitchClick() {
      if (this.isClocking) {
        this.dialog.switchClockDialog = !this.dialog.switchClockDialog
      } else {
        this.switchTimerState()
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
        // 在计时器开始时，记录任务开始时间
        if (this.tick === this.totalTime) {
          this.startTimestamp = Date.now()
        }
        this.timer.start(this.tick)
      }
    },
    switchToWorkState() {
      this.status = 0
      this.tick = this.totalTime
    },
    switchToRestState() {
      this.status = 1
      this.tick = this.totalTime
    },
    switchTimerState() {
      this.progress = 100
      this.status = (this.status + 1) % 2
      this.tick = this.totalTime
    },
    // 计时器结束执行
    changeTimer() {
      this.switchTimerState()

      setTimeout(() => {
        if (this.automaticTiming.working && this.isWorkingTime) {
          this.startTimer()
        }
        if (this.automaticTiming.resting && this.isRestingTime) {
          this.startTimer()
        }
      }, this.resetTimeout)
    },
    handleSwitchTimer() {
      this.timer.stop()
      this.dialog.switchClockDialog = false

      setTimeout(() => {
        this.switchTimerState()
        if (this.isSwitchAndStartTimer) {
          this.startTimer()
          this.isSwitchAndStartTimer = false
        }
      }, 100)
    },
    startTaskTimer(task) {
      if (this.isWorkingTime && this.isClocking) {
        if (task.title === this.taskName) {
          this.snackbar('正在专注中')
        } else {
          this.tempTask = task
          this.dialog.turnToTaskDialog = true
        }
      } else {
        this.tempTask = task
        this.turnToTaskTimer()
      }
    },
    turnToTaskTimer() {
      this.timer.stop()
      this.switchToWorkState()
      this.startTimer()

      this.taskName = this.tempTask.title
      this.tempTask = null
      this.dialog.turnToTaskDialog = false
    },
    handleRestoreTimer() {
      let duration = Math.floor((this.totalTime - this.tick) / 60)
      if (duration >= 1) {
        console.log('save')
        // 打开记录专注效率对话框
        if (this.enableFocusEfficiency && this.isWorkingTime) {
          this.focusTaskName = this.showTip
          this.focusDuration = duration
          this.dialog.obtainFocusResultDialog = true
        } else {
          statistics.add(this.showTip, duration, this.currentStatus, this.startTimestamp, Date.now(), false)
        }
      }

      this.timer.stop()
      this.taskName = ''
      this.dialog.restoreDialog = false
    },
    handleObtainFocusResult() {
      statistics.add(
        this.focusTaskName,
        this.focusDuration,
        this.currentStatus,
        this.startTimestamp,
        Date.now(),
        true,
        this.focusResult
      )

      if (this.isCompleted) {
        this.changeTimer()
      }
      this.focusResult = FocusEfficiency.ORDINARY
      this.dialog.obtainFocusResultDialog = false
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
                  this.tempTask = new Task(title)
                  this.dialog.addTaskConfirmDialog = true
                }
              })
            } else if (!this.isClocking) {
              this.switchToWorkState()
              this.startTimer()
            } else if (this.isRestingTime) {
              this.dialog.switchClockDialog = true
              this.isSwitchAndStartTimer = true
            }
            break
          case UToolsFeatureCodes.Rest:
            if (!this.isClocking) {
              this.switchToRestState()
              this.startTimer()
            } else if (this.isWorkingTime) {
              this.dialog.switchClockDialog = true
              this.isSwitchAndStartTimer = true
            }
            break
          case UToolsFeatureCodes.StopOrContinue:
            if (!this.isCompleted) this.startTimer()
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

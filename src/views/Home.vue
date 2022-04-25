<template>
  <div id="page">
    <v-img
      class="background-img"
      :style="{backgroundColor: bgColor}"
      :src="bgImage"
    ></v-img>

    <div class="toolbar">
      <v-btn
        icon
        fab
        :dark="darkStyle"
        :light="!darkStyle"
        class="dashboard-btn"
        title="统计"
        @click="toStatistic"
      >
        <MyIcon>mdi-view-dashboard-outline</MyIcon>
      </v-btn>

      <v-btn
        icon
        fab
        :dark="darkStyle"
        :light="!darkStyle"
        class="setting-btn"
        @click="toSetting"
        title="设置"
      >
        <MyIcon>mdi-cog-outline</MyIcon>
      </v-btn>

      <AudioPanel class="audio-btn" :dark="darkStyle"></AudioPanel>

      <v-btn
        :dark="darkStyle"
        :light="!darkStyle"
        icon
        fab
        class="todo-btn"
        @click="drawer = true"
        title="待办事项"
      >
        <MyIcon>mdi-format-list-checks</MyIcon>
      </v-btn>
    </div>

    <v-navigation-drawer
      v-model="drawer"
      width="360"
      absolute
      right
      temporary
    >
      <TodoPanel></TodoPanel>
    </v-navigation-drawer>

    <div id="main">
      <div class="container" :style="{minHeight: progressContainer + 'px'}">
        <div class="quote-div ">
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
            :color="darkStyle ? '#E4EAF0' : '#6C6C6C'"
          >
            <div class="tick-time-div">
              <div>
                <MyIcon :dark="darkStyle" :light="!darkStyle" v-show="isWorkingTime">mdi-laptop</MyIcon>
                <MyIcon :dark="darkStyle" :light="!darkStyle" v-show="!isWorkingTime">mdi-coffee-outline</MyIcon>
              </div>

              <div class="tick" :class="fontColorClass">
                {{ tickTime }}
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
            :dark="darkStyle"
            :light="!darkStyle"
            title="切换计时器"
            @click.stop="handleSwitchTimerClick"
          >
            <MyIcon>mdi-rotate-3d-variant</MyIcon>
          </v-btn>
          <v-btn
            icon
            fab
            large
            :dark="darkStyle"
            :light="!darkStyle"
            title="开始计时"
            @click.stop="startTimer"
          >
            <MyIcon v-show="isPlaying">mdi-pause-circle</MyIcon>
            <MyIcon v-show="!isPlaying">mdi-arrow-right-drop-circle</MyIcon>
          </v-btn>
          <v-btn
            icon
            fab
            :dark="darkStyle"
            :light="!darkStyle"
            title="重置计时"
            @click.stop="handleRestoreTimerClick"
          >
            <MyIcon>mdi-restore</MyIcon>
          </v-btn>
        </div>
      </div>
    </div>

    <Dialog
      title="将要退出计时器？"
      :show="dialog.quitClockToSettingDialog"
      @confirm="$router.push('/setting')"
      @cancel="dialog.quitClockToSettingDialog = false"
    >
    </Dialog>

    <Dialog
      title="将要退出计时器？"
      :show="dialog.quitClockToStatisticDialog"
      @confirm="$router.push('/statistic')"
      @cancel="dialog.quitClockToStatisticDialog = false"
    >
    </Dialog>

    <Dialog
      :title="'当前正在' + currentTip + '中，是否切换计时器？'"
      :show="dialog.switchClockDialog"
      @confirm="switchDialogOk"
      @cancel="dialog.switchClockDialog = false"
    >
    </Dialog>

    <Dialog
      title="是否重置计时器？"
      :show="dialog.restoreDialog"
      @confirm="restoreDialogOk"
      @cancel="dialog.restoreDialog = false"
    >
    </Dialog>
  </div>
</template>

<script>
import Timer from 'timer.js'
import {getQuoteByName} from '@/api/quote'
import {formatSecond} from '@/util/durations'
import {requestNotificationPermission, showNotice} from '@/util/notifications'
import {backgroundType, clockChinese, clockStatus, uToolsFeatureCodes} from '@/config/constants'
import settings from '@/store/settings'
import {getImageByName} from '@/api/image'
import statistics from '@/store/statistics'
import Dialog from '@/components/Dialog'
import AudioPanel from '@/components/Audio/AudioPanel'
import dayjs from 'dayjs'
import {isUTools} from '@/util/platforms'
import {mapState} from 'vuex'
import {getSubjectHexColor, hexToBrightness} from '@/util/colors'
import TodoPanel from '@/components/Todo/TodoPanel'
import MyIcon from '@/components/MyIcon'


export default {
  name: 'Home',
  components: {MyIcon, TodoPanel, Dialog, AudioPanel},
  data() {
    return {
      timer: {},
      tick: 0,
      isPlaying: false,
      status: 0,
      progress: 100,
      resetTimeout: 500,
      notifyBeforeEndOfTime: 15,
      backgroundImage: '',
      quoteText: '',
      customTip: '',
      dialog: {
        restoreDialog: false,
        switchClockDialog: false,
        quitClockToSettingDialog: false,
        quitClockToStatisticDialog: false
      },
      isSwitchAndStartTimer: false,
      drawer: false,
      darkStyle: true
    }
  },
  computed: {
    ...mapState({
      background: state => state.background,
      quote: state => state.quote,
      workingTime: state => state.workingTime,
      restingTime: state => state.restingTime,
      notification: state => state.notification
    }),
    progressSize() {
      if (this.isUTools) return 290
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return 250
        case 'sm':
          return 270
        default:
          return 300
      }
    },
    progressContainer() {
      if (this.isUTools) return 475
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return 300
        case 'sm':
          return 450
        default:
          return 500
      }
    },
    tickTime() {
      return formatSecond(this.tick)
    },
    showTip() {
      return this.isWorkingTime && this.customTip ? this.customTip : this.currentTip
    },
    currentTip() {
      return this.statusDetails[this.status]
    },
    ratio() {
      return 100 / this.totalTime
    },
    statusDetails() {
      return [clockChinese[clockStatus.WORK], clockChinese[clockStatus.REST]]
    },
    fontColorClass() {
      return this.darkStyle ? 'font-dark' : 'font-light'
    },
    bgColor() {
      return this.background.type === backgroundType.COLOR ? this.background.val : ''
    },
    bgImage() {
      return this.background.type !== backgroundType.COLOR ? this.backgroundImage : ''
    },
    totalTime() {
      return this.status ? this.restingTime : this.workingTime
    },
    isWorkingTime() {
      return this.status === 0
    },
    isRestingTime() {
      return this.status === 1
    },
    currentStatus() {
      return this.status ? clockStatus.REST : clockStatus.WORK
    },
    isUTools() {
      return isUTools()
    }
  },
  created() {
    requestNotificationPermission()
    this.getImage()
    this.getQuote()
  },
  mounted() {
    window.document.documentElement.style.overflowY = 'hidden'

    const that = this

    this.tick = this.totalTime
    this.timer = new Timer({
      tick: 1,
      ontick(ms) {
        let s = Math.round(ms / 1000)
        that.tick = s
        that.progress = s * that.ratio
        if (that.status === 0 && that.notification.beforeEndOfWorkingTime &&
          that.tick === that.notifyBeforeEndOfTime) {
          showNotice('准备休息啦', 5000)
        }
      },
      onstart() {
        this.isPlaying = true
        if (that.isWorkingTime) that.playBackgroundMusic()
      },
      onpause() {
        this.isPlaying = false
        if (that.isWorkingTime) that.pauseBackgroundMusic()
      },
      onstop() {
        if (that.isWorkingTime) that.pauseBackgroundMusic()

        that.tick = that.totalTime
        that.progress = 100
        that.isPlaying = false
      },
      onend() {
        if (that.isWorkingTime) that.pauseBackgroundMusic()

        if (that.status === 0 && that.notification.whenEndOfWorkingTime) {
          showNotice('专注结束了，休息一下吧')
        }
        if (that.status === 1 && that.notification.whenEndOfRestingTime) {
          showNotice('休息结束啦')
        }
        that.tick = 0
        that.progress = 0
        that.isPlaying = false

        statistics.add(that.showTip, that.totalTime / 60, that.currentStatus)

        that.switchClock()

        setTimeout(() => {
          that.tick = that.totalTime
          that.progress = 100
        }, that.resetTimeout)
      }
    })

    if (isUTools()) {
      this.uToolsMode()
    }

    this.$bus.$on('startTaskTimer', this.startTaskTimer)
  },
  beforeDestroy() {
    this.timer.stop()
    this.$bus.$off('startTimer')
    this.$bus.$emit('stopAudio')
  },
  methods: {
    startTaskTimer(task) {
      this.timer.stop()
      this.switchToWork()
      this.startTimer()
      this.customTip = task.title
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
      this.darkStyle = hexToBrightness(bgHexColor) <= 0.8
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
    startTimer() {
      this.isPlaying ? this.timer.pause() : this.timer.start(this.tick)
      this.isPlaying = !this.isPlaying
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
    switchToRest() {
      this.status = 1
      this.tick = this.totalTime
    },
    handleSwitchTimerClick() {
      this.isPlaying ? this.dialog.switchClockDialog = true : this.switchClock()
    },
    switchDialogOk() {
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
    handleRestoreTimerClick() {
      this.dialog.restoreDialog = true
    },
    restoreDialogOk() {
      this.timer.stop()
      this.dialog.restoreDialog = false
    },
    toSetting() {
      this.isPlaying ? this.dialog.quitClockToSettingDialog = true : this.$router.push('/setting')
    },
    toStatistic() {
      this.isPlaying ? this.dialog.quitClockToStatisticDialog = true : this.$router.push('/statistic')
    },
    uToolsMode() {
      utools.onPluginEnter(({code}) => {
        switch (code) {
          case uToolsFeatureCodes.Work:
            if (!this.isPlaying) {
              this.switchToWork()
              this.startTimer()
            } else if (this.isRestingTime) {
              this.dialog.switchClockDialog = true
              this.isSwitchAndStartTimer = true
            }
            break
          case uToolsFeatureCodes.Rest:
            if (!this.isPlaying) {
              this.switchToRest()
              this.startTimer()
            } else if (this.isWorkingTime) {
              this.dialog.switchClockDialog = true
              this.isSwitchAndStartTimer = true
            }
            break
          case uToolsFeatureCodes.StopOrContinue:
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

#page
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
      line-height: 30px
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

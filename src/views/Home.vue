<template>
  <div id="page">
    <v-img
      class="background-img"
      :style="{'background-color': bgColor}"
      :src="bgImage"
    ></v-img>

    <div class="toolbar">
      <v-btn
        icon
        fab
        large
        :dark="darkStyle"
        class="dashboard-btn"
        title="统计"
        @click="toStatistic"
      >
        <v-icon>mdi-view-dashboard-outline</v-icon>
      </v-btn>

      <v-btn
        icon
        fab
        large
        :dark="darkStyle"
        class="setting-btn"
        @click="toSetting"
        title="设置"
      >
        <v-icon>mdi-cog-outline</v-icon>
      </v-btn>

      <v-btn
        v-if="!isUtools"
        icon
        fab
        large
        :dark="darkStyle"
        class="full-btn"
        title="全屏"
        @click="fullBtnClick"
      >
        <v-icon>mdi-arrow-expand-all</v-icon>
      </v-btn>
    </div>

    <div id="main">
      <div class="container">
        <div class="quote-div ">
          <div class="quote-content-div" :style="{'color': (darkStyle ? 'white': '#141111')}" v-show="quoteText">
            「 {{ quoteText }} 」
          </div>
        </div>

        <div class="timer-div">
          <v-progress-circular
            :rotate="-90"
            :size="290"
            :width="10"
            :value="progress"
            :color="darkStyle ? 'grey lighten-1' : 'grey darken-3'"
          >
            <div class="tick-time-div">
              <div>
                <v-icon
                  :dark="darkStyle" :title="currentTip" v-if="isWorkingTime"
                >
                  mdi-laptop
                </v-icon>
                <v-icon
                  :dark="darkStyle" :title="currentTip" v-else
                >
                  mdi-coffee-outline
                </v-icon>
              </div>
              <div class="tick" :style="{'color': (darkStyle ? 'white': '#141111')}">{{ tickTime }}</div>
            </div>
          </v-progress-circular>
        </div>

        <div class="btn-group">
          <v-btn
            color="transparent"
            fab
            :dark="darkStyle"
            title="切换计时器"
            @click.stop="switchTimer"
          >
            <v-icon>mdi-rotate-3d-variant</v-icon>
          </v-btn>
          <v-btn
            color="transparent"
            fab
            large
            :dark="darkStyle"
            title="开始计时"
            @click.stop="startTimer"
          >
            <v-icon v-if="isPlaying">mdi-pause-circle</v-icon>
            <v-icon v-else>mdi-arrow-right-drop-circle</v-icon>
          </v-btn>
          <v-btn
            color="transparent"
            fab
            :dark="darkStyle"
            title="重置计时"
            @click.stop="restoreTimer"
          >
            <v-icon>mdi-restore</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <Dialog
      title="将要退出计时器？"
      :show="quitClockToSettingDialog"
      @confirm="quitClockToSettingDialogOk"
      @cancel="quitClockToSettingDialog = false"
    >
    </Dialog>

    <Dialog
      title="将要退出计时器？"
      :show="quitClockToStatisticDialog"
      @confirm="quitClockToStatisticDialogOk"
      @cancel="quitClockToStatisticDialog = false"
    >
    </Dialog>

    <Dialog
      :title="'当前正在' + currentTip + '中，是否切换计时器？'"
      :show="switchClockDialog"
      @confirm="switchDialogOk"
      @cancel="switchClockDialog = false"
    >
    </Dialog>

    <Dialog
      title="是否重置计时器？"
      :show="restoreDialog"
      @confirm="restoreDialogOk"
      @cancel="restoreDialog = false"
    >
    </Dialog>
  </div>
</template>

<script>
import Timer from 'timer.js'
import {getQuoteByName} from '@/api/quote'
import {formatSecond} from '@/util/durations'
import {requestNotificationPermission, showNotice} from '@/util/notifications'
import {backgroundType, uToolsFeatureCodes} from '@/store/constants'
import settings from '@/store/settings'
import {toggleFull} from 'be-full'
import {getImageByName} from '@/api/image'
import statistics from '@/store/statistics'
import Dialog from '@/components/Dialog'
import dayjs from 'dayjs'
import {isUTools} from '@/util/platforms'
import {mapState} from 'vuex'
import {getSubjectHexColor, hexToBrightness} from '@/util/colors'

export default {
  name: 'Home',
  components: {Dialog},
  data() {
    return {
      timer: {},
      tick: 0,
      isPlaying: false,
      status: 0,
      statusDetails: ['工作', '休息'],
      progress: 100,
      resetTimeout: 500,
      notifyBeforeEndOfTime: 15,
      backgroundImage: '',
      quoteText: '',
      restoreDialog: false,
      switchClockDialog: false,
      quitClockToSettingDialog: false,
      quitClockToStatisticDialog: false,
      switchDialogAndStart: false,
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
    tickTime() {
      return formatSecond(this.tick)
    },
    ratio() {
      return 100 / this.totalTime
    },
    bgColor() {
      return this.background.type === backgroundType.COLOR ? this.background.val : ''
    },
    bgImage() {
      return this.background.type !== backgroundType.COLOR ? this.backgroundImage : ''
    },
    currentTip() {
      return this.statusDetails[this.status]
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
    isUtools() {
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
        that.tick = Math.round(ms / 1000)
        that.progress -= that.ratio
        if (that.status === 0 && that.notification.beforeEndOfWorkingTime &&
          that.tick === that.notifyBeforeEndOfTime) {
          showNotice('准备休息啦', 3000)
        }
      },
      onstop() {
        that.tick = that.totalTime
        that.progress = 100
        that.isPlaying = false
      },
      onend() {
        if (that.status === 0 && that.notification.whenEndOfWorkingTime) {
          showNotice('工作结束了，休息一下吧')
        }
        if (that.status === 1 && that.notification.whenEndOfRestingTime) {
          showNotice('休息结束啦')
        }
        that.tick = 0
        that.progress = 0
        that.isPlaying = false

        if (that.isWorkingTime) {
          statistics.add(that.currentTip, that.totalTime / 60)
        }
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
  },
  beforeDestroy() {
    this.timer.stop()
  },
  methods: {
    changeColor(bgHexColor) {
      this.darkStyle = hexToBrightness(bgHexColor) <= 0.7
    },
    getImage() {
      if (this.bgColor) {
        this.changeColor(this.bgColor)
        return
      }

      settings.getAttachment(this.background.type).then(res => {
        if (!res.data || this.background.type === backgroundType.IMAGE || this.background.updateTime !== dayjs().format('YYYYMMDD')) {
          getImageByName(this.background.type).then(data => {
            // 图片缓存
            settings.setAttachment(this.background.type, data)
              .then(() => {
                getSubjectHexColor(data).then(res => this.changeColor(res))
                this.backgroundImage = data
                this.$store.commit('UPDATE_BACKGROUND', [this.background.type])
              })
          })
          return
        }
        getSubjectHexColor(res.data).then(res => this.changeColor(res))
        this.backgroundImage = res.data
      })
    },
    getQuote() {
      getQuoteByName(this.quote.type).then(data => this.quoteText = data['content'])
    },
    switchTimer() {
      this.isPlaying ? this.switchClockDialog = true : this.switchClock()
    },
    switchDialogOk() {
      this.timer.stop()
      this.switchClock()
      this.switchClockDialog = false
      if (this.switchDialogAndStart) {
        this.startTimer()
        this.switchDialogAndStart = false
      }
    },
    startTimer() {
      this.isPlaying ? this.timer.pause() : this.timer.start(this.tick)
      this.isPlaying = !this.isPlaying
    },
    restoreTimer() {
      this.restoreDialog = true
    },
    restoreDialogOk() {
      this.timer.stop()
      this.restoreDialog = false
    },
    toSetting() {
      this.isPlaying ? this.quitClockToSettingDialog = true : this.$router.push('/setting')
    },
    quitClockToSettingDialogOk() {
      this.quitClockToSettingDialog = false
      this.$router.push('/setting')
    },
    toStatistic() {
      this.isPlaying ? this.quitClockToStatisticDialog = true : this.$router.push('/statistic')
    },
    quitClockToStatisticDialogOk() {
      this.quitClockToStatisticDialog = false
      this.$router.push('/statistic')
    },
    switchClock() {
      this.progress = 100
      this.status = (this.status + 1) % 2
      this.tick = this.totalTime
    },
    switchToWork() {
      this.status = 0
      this.tick = this.totalTime
    },
    switchToRest() {
      this.status = 1
      this.tick = this.totalTime
    },
    fullBtnClick() {
      toggleFull()
    },
    uToolsMode() {
      utools.onPluginEnter(({code}) => {
        switch (code) {
          case uToolsFeatureCodes.Work:
            if (!this.isPlaying) {
              this.switchToWork()
              this.startTimer()
            } else if (this.isRestingTime) {
              this.switchClockDialog = true
              this.switchDialogAndStart = true
            }
            break
          case uToolsFeatureCodes.Rest:
            if (!this.isPlaying) {
              this.switchToRest()
              this.startTimer()
            } else if (this.isWorkingTime) {
              this.switchClockDialog = true
              this.switchDialogAndStart = true
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

<style scoped>
#page {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.background-img {
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: #616161;
  z-index: -10;
}

.toolbar {
  position: fixed;
}

.toolbar .dashboard-btn {
  position: fixed;
  top: 2px;
  left: 2px;
}

.toolbar .full-btn {
  position: fixed;
  bottom: 2px;
  right: 2px;
}

.toolbar .setting-btn {
  position: fixed;
  top: 2px;
  right: 2px;
}

#main {
  width: 100%;
  height: 100%;
  display: flex;
  justify-items: center;
  align-items: center;
}

.container {
  height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.quote-div {
  height: 30px;
  color: white;
  text-align: center;
  margin: 0 45px;
  line-height: 30px;
  font-size: large;
}

.timer-div .tick-time-div {
  color: white;
  text-align: center;
}

.timer-div .tick-time-div .tick {
  font-size: 50px;
  font-weight: bold;
}

.btn-group {
  width: 200px;
  display: flex;
  justify-content: space-between;
}
</style>

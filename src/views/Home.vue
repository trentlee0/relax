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
        dark
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
        dark
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
        dark
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
          <div class="quote-content-div" v-show="quote.content">
            「 {{ quote.content }} 」
          </div>
        </div>

        <div class="timer-div">
          <v-progress-circular
            :rotate="-90"
            :size="290"
            :width="10"
            :value="progress"
            color="#bdbdbd"
          >
            <div class="tick-time-div">
              <div>
                <v-icon dark v-if="isWorkingTime" :title="currentTip">mdi-laptop</v-icon>
                <v-icon dark v-else title="休息" :title="currentTip">mdi-coffee-outline</v-icon>
              </div>
              <div class="tick">{{ tickTime }}</div>
            </div>
          </v-progress-circular>
        </div>

        <div class="btn-group">
          <v-btn
            color="transparent"
            fab
            dark
            title="切换计时器"
            @click.stop="switchTimer"
          >
            <v-icon>mdi-rotate-3d-variant</v-icon>
          </v-btn>
          <v-btn
            color="transparent"
            fab
            large
            dark
            title="开始计时"
            @click.stop="startTimer"
          >
            <v-icon v-if="isPlaying">mdi-pause-circle</v-icon>
            <v-icon v-else>mdi-arrow-right-drop-circle</v-icon>
          </v-btn>
          <v-btn
            color="transparent"
            fab
            dark
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
import {backgroundType, quoteType, uToolsFeatureCodes} from '@/util/constants'
import storage from '@/util/storages'
import {toggleFull} from 'be-full'
import {getImageByName} from '@/api/image'
import statistics from '@/util/statistics'
import Dialog from '@/components/Dialog'
import dayjs from 'dayjs'
import {isUtools} from '@/util/platforms'

export default {
  name: 'Home',
  components: {Dialog},
  data() {
    return {
      background: {
        type: '',
        val: '',
        updateTime: ''
      },
      quote: {
        content: '',
        author: ''
      },
      total: 0,
      timer: {},
      tick: 0,
      progress: 100,
      isPlaying: false,
      clocks: [],
      status: 0,
      statusDetails: ['工作', '休息'],
      resetTimeout: 500,
      beforeEndTime: 15,
      notification: {
        whenEndOfWorkingTime: true,
        beforeEndOfWorkingTime: false,
        whenEndOfRestingTime: true
      },
      restoreDialog: false,
      switchClockDialog: false,
      quitClockToSettingDialog: false,
      quitClockToStatisticDialog: false,
      switchDialogAndStart: false
    }
  },
  computed: {
    tickTime() {
      return formatSecond(this.tick)
    },
    bgColor() {
      return this.background.type === backgroundType.COLOR ? this.background.val : ''
    },
    bgImage() {
      return this.background.type === backgroundType.UNSPLASH
      || this.background.type === backgroundType.IMAGE
      || this.background.type === backgroundType.SHANBAY
      || this.background.type === backgroundType.BING ? this.background.val : ''
    },
    currentTip() {
      return this.statusDetails[this.status]
    },
    isWorkingTime() {
      return this.status === 0
    },
    isRestingTime() {
      return this.status === 1
    },
    isUtools() {
      return isUtools()
    }
  },
  created() {
    this.initState()
    requestNotificationPermission()
  },
  mounted() {
    window.document.documentElement.style.overflowY = 'hidden'

    const that = this
    this.tick = this.total
    this.timer = new Timer({
      tick: 1,
      ontick(ms) {
        that.tick = Math.round(ms / 1000)
        that.progress -= 100 / that.total
        if (that.status === 0 && that.notification.beforeEndOfWorkingTime &&
          that.tick === that.beforeEndTime) {
          showNotice('准备休息啦', 3000)
        }
      },
      onstop() {
        that.tick = that.total
        that.progress = 100
        that.isPlaying = false
      },
      onend() {
        if (that.status === 0 && that.notification.whenEndOfWorkingTime) {
          showNotice('休息一下吧')
        }
        if (that.status === 1 && that.notification.whenEndOfRestingTime) {
          showNotice('休息结束啦')
        }
        that.tick = 0
        that.progress = 0
        that.isPlaying = false

        if (that.isWorkingTime) {
          statistics.add(that.currentTip, that.total / 60)
        }
        that.switchClock()

        setTimeout(() => {
          that.tick = that.total
          that.progress = 100
        }, that.resetTimeout)
      }
    })

    if (isUtools()) {
      this.uToolsMode()
    }
  },
  beforeDestroy() {
    this.timer.stop()
  },
  methods: {
    initState() {
      const now = dayjs().format('YYYY年M月D日')
      const background = this.$store.getters.getBackground
      if (background) {
        if ((background.type === backgroundType.UNSPLASH
            || background.type === backgroundType.SHANBAY
            || background.type === backgroundType.BING)
          && background.updateTime !== now) {
          this.getImage(background.type, now)
        } else {
          this.background = background
        }
      } else {
        storage.initData()
        this.getImage(backgroundType.UNSPLASH, now)
      }

      let quote = this.$store.getters.getQuote
      if (this.$store.getters.getQuote) {
        if (quote.type === quoteType.HITOKOTO || quote.type === quoteType.SHANBAY) {
          this.getQuote(this.$store.getters.getQuote.type)
        } else if (quote.type === quoteType.CUSTOM) {
          this.quote = {content: quote.val}
        }
      } else {
        this.getQuote(quoteType.HITOKOTO)
      }

      this.clocks.push(this.$store.getters.getWorkingTime ? this.$store.getters.getWorkingTime : 45 * 60)
      this.clocks.push(this.$store.getters.getRestingTime ? this.$store.getters.getRestingTime : 5 * 60)
      this.total = this.clocks[this.status]

      if (this.$store.getters.getNotification) {
        this.notification = this.$store.getters.getNotification
      }
    },
    getImage(name, date) {
      getImageByName(name).then(data => {
        this.background = {
          type: name,
          val: data,
          updateTime: date
        }

        this.$store.commit('SET_BACKGROUND_BUILTIN', [name, this.background])
      })
    },
    getQuote(name) {
      getQuoteByName(name)
        .then(data => {
          this.quote = data
        })
    },
    switchTimer() {
      if (this.isPlaying) {
        this.switchClockDialog = true
      } else {
        this.switchClock()
      }
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
      if (this.isPlaying) {
        this.timer.pause()
      } else {
        this.timer.start(this.tick)
      }
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
      if (this.isPlaying) {
        this.quitClockToSettingDialog = true
      } else {
        this.$router.push('/setting')
      }
    },
    quitClockToSettingDialogOk() {
      this.quitClockToSettingDialog = false
      this.$router.push('/setting')
    },
    toStatistic() {
      if (this.isPlaying) {
        this.quitClockToStatisticDialog = true
      } else {
        this.$router.push('/statistic')
      }
    },
    quitClockToStatisticDialogOk() {
      this.quitClockToStatisticDialog = false
      this.$router.push('/statistic')
    },
    switchClock() {
      this.status = (this.status + 1) % 2
      this.total = this.clocks[this.status]
      this.tick = this.total
    },
    switchToWork() {
      this.status = 0
      this.total = this.clocks[this.status]
      this.tick = this.total
    },
    switchToRest() {
      this.status = 1
      this.total = this.clocks[this.status]
      this.tick = this.total
    },
    fullBtnClick() {
      toggleFull()
    },
    uToolsMode() {
      utools.onPluginEnter(({code, type, payload}) => {
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
            if (this.tick !== this.total) this.startTimer()
            break
        }
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

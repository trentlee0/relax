<template>
  <div>
    <v-bottom-sheet
      :value="isShow"
      @click:outside="closeEvent"
      @keydown.esc.stop="closeEvent"
    >
      <v-sheet class="text-center pa-6">
        <v-row dense>
          <v-col cols="2">
            <v-card
              color="secondary"
              class="d-flex align-center justify-center align-center"
              :class="{active: isNoneAudio}"
              height="80"
              title="关闭背景音乐"
              @click="changeAudio()"
            >
              <MyIcon dark large>mdi-volume-off</MyIcon>
            </v-card>
          </v-col>

          <v-col
            v-for="(card, index) in cards"
            :key="index"
            cols="2"
          >
            <v-card
              @click="changeAudio(index)"
              :title="card.title"
            >
              <v-img
                class="white--text align-end"
                height="80"
                gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                :src="card.src"
                :class="{active: audioIndex === index}"
              >
                <v-card-subtitle v-text="card.title"></v-card-subtitle>
              </v-img>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-slider
            :hint="'音量 ' + viewVolume + '%'"
            max="100"
            min="0"
            dense
            thumb-label
            persistent-hint
            v-model="viewVolume"
          ></v-slider>
        </v-row>
      </v-sheet>
    </v-bottom-sheet>
  </div>
</template>

<script>
import {Howl, Howler} from 'howler'
import audios from '@/common/audio'
import MyIcon from '@/components/MyIcon'
import {Settings} from '@/common/constant'
import hotkeys from 'hotkeys-js'
import shortcuts from '@/common/shortcuts'

export default {
  name: 'AudioPanel',
  components: {MyIcon},
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isPlaying: false,
      isMuted: false,
      audioIndex: -1,
      realVolume: 0.5,
      sound: null,
      audios: [],
      cards: [],
      audioPanel: false,
      prevVolume: 0
    }
  },
  computed: {
    viewVolume: {
      set(val) {
        this.realVolume = val / 100
        this.isMuted = this.realVolume === 0
        if (!this.isPlaying || this.isNoneAudio) return
        this.setVolume(this.realVolume)
      },
      get() {
        return Math.round(this.realVolume * 100)
      }
    },
    currentAudioCardName() {
      return this.isNoneAudio ? Settings.DEFAULT.backgroundMusic.selected : this.cards[this.audioIndex].name
    },
    isNoneAudio() {
      return this.audioIndex === -1
    }
  },
  created() {
    hotkeys(Object.values(shortcuts.audio).join(','), 'home', (event, handler) => {
      event.preventDefault()
      if (!this.isShow) return
      switch (handler.key) {
        case shortcuts.audio.UP_MOVE:
          this.setVolume(this.realVolume + 0.05)
          break
        case shortcuts.audio.DOWN_MOVE:
          this.setVolume(this.realVolume - 0.05)
          break
        case shortcuts.audio.LEFT_MOVE:
          this.changeAudio(this.audioIndex === -1 ? this.audios.length - 1 : this.audioIndex - 1)
          break
        case shortcuts.audio.RIGHT_MOVE:
          this.changeAudio(this.audioIndex === this.audios.length - 1 ? -1 : this.audioIndex + 1)
          break
      }
    })
  },
  mounted() {
    this.audios = audios.map(item => item.path)
    this.cards = audios.map(item => ({name: item.name, title: item.chinese, src: item.picture}))

    this.audioIndex = this.cards.findIndex(card => card.name === this.$store.state.settings.backgroundMusic.selected)

    this.realVolume = this.$store.state.settings.backgroundMusic.volume

    window.onload = () => this.initAudio()

    this.$bus.$on('playAudio', this.playAudio)
    this.$bus.$on('pauseAudio', this.pauseAudio)
    this.$bus.$on('stopAudio', this.stopAudio)
    this.$bus.$on('switchMute', this.switchMute)
  },
  beforeDestroy() {
    this.$bus.$off('playAudio')
    this.$bus.$off('pauseAudio')
    this.$bus.$off('stopAudio')
    this.$bus.$off('switchMute')
  },
  methods: {
    initAudio(index = 0) {
      const that = this
      this.sound = new Howl({
        src: [that.audios[index]],
        loop: true,
        volume: that.realVolume,
        onplay() {
          that.isPlaying = true
        },
        onpause() {
          that.isPlaying = false
        }
      })
    },
    playAudio() {
      if (this.sound) {
        this.sound.stop()
        this.initAudio(this.audioIndex)
        this.sound.play()
      } else {
        this.initAudio(this.audioIndex)
        this.sound.play()
      }
    },
    pauseAudio() {
      if (this.sound) this.sound.pause()
    },
    stopAudio() {
      if (this.sound) this.sound.stop()
    },
    setVolume(vol) {
      this.realVolume = vol
      if (this.sound) {
        this.sound.volume(vol)
        this.$store.commit('SET_BACKGROUND_MUSIC', [this.currentAudioCardName, this.realVolume])
      }
    },
    switchMute() {
      this.isMuted = !this.isMuted
      Howler.mute(this.isMuted)
      if (this.isMuted) {
        if (this.realVolume === 0) return
        this.prevVolume = this.realVolume
        this.realVolume = 0
        this.setVolume(0)
      } else {
        this.setVolume(this.prevVolume)
      }
    },
    changeAudio(index = -1) {
      if (index === this.audioIndex) {
        this.isPlaying ? this.pauseAudio() : this.playAudio()
      } else {
        if (index === -1) this.pauseAudio()
        this.audioIndex = index
        this.$store.commit('SET_BACKGROUND_MUSIC', [this.currentAudioCardName, this.realVolume])
        this.playAudio()
      }
    },
    closeEvent() {
      this.$emit('close')
    }
  },
  watch: {
    isVolumeOff(newVal) {
      if (newVal) {
        this.$emit('volumeChange', {mode: 'volumeOff'})
      }
    },
    isVolumeMute(newVal) {
      if (newVal) {
        this.$emit('volumeChange', {mode: 'volumeMute'})
      }
    },
    isVolumeHigh(newVal) {
      if (newVal) {
        this.$emit('volumeChange', {mode: 'volumeHigh'})
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.active
  opacity: 0.28
</style>

<template>
  <div id="container">
    <v-bottom-sheet v-model="audioPanel">
      <v-sheet class="text-center pa-6">
        <v-row dense>
          <v-col cols="2">
            <v-card
              color="secondary"
              class="d-flex align-center justify-center align-center"
              :class="{active: currentIndex === noneAudioIndex}"
              dark
              height="80"
              @click="changeAudio(noneAudioIndex)"
            >
              <MyIcon large>mdi-volume-off</MyIcon>
            </v-card>
          </v-col>

          <v-col
            v-for="(card, index) in cards"
            :key="index"
            cols="2"
          >
            <v-card
              @click="changeAudio(index)"
            >
              <v-img
                class="white--text align-end"
                height="80"
                gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                :src="card.src"
                :class="{active: currentIndex === index}"
              >
                <v-card-subtitle v-text="card.title"></v-card-subtitle>
              </v-img>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-slider
            hint="音量"
            max="100"
            min="0"
            thumb-label
            v-model="viewVolume"
          ></v-slider>
        </v-row>
      </v-sheet>
    </v-bottom-sheet>
    <div class="music-btn">
      <v-btn
        icon
        fab
        :dark="dark"
        :light="!dark"
        @click.native="openAudioPanel"
        title="背景音"
      >
        <MyIcon v-show="isVolumeOff">mdi-volume-off</MyIcon>
        <MyIcon v-show="!isVolumeOff && isMuted">mdi-volume-mute</MyIcon>
        <MyIcon v-show="!isVolumeOff && !isMuted">mdi-volume-high</MyIcon>
      </v-btn>
    </div>
  </div>
</template>

<script>
import {isUTools} from '@/util/platforms'
import {Howl, Howler} from 'howler'
import audios from '@/config/audios'
import MyIcon from '@/components/MyIcon'
import {defaultSettings} from '@/config/constants'

export default {
  name: 'AudioPanel',
  components: {MyIcon},
  props: {
    dark: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isPlaying: false,
      currentIndex: -1,
      muted: false,
      realVolume: 0.5,
      sound: null,
      audios: [],
      cards: [],
      audioPanel: false,
      prevVolume: 0
    }
  },
  computed: {
    isUTools() {
      return isUTools()
    },
    isVolumeOff() {
      return this.currentIndex === this.noneAudioIndex
    },
    isMuted() {
      return this.muted
    },
    viewVolume: {
      set(val) {
        this.realVolume = val / 100
        this.muted = this.realVolume === 0
        if (!this.isPlaying || this.currentIndex === this.noneAudioIndex) return
        this.setVolume(this.realVolume)
      },
      get() {
        return this.realVolume * 100
      }
    },
    currentAudioCardName() {
      return this.currentIndex === this.noneAudioIndex ? defaultSettings.backgroundMusic.selected : this.cards[this.currentIndex].name
    },
    noneAudioIndex() {
      return -1
    }
  },
  mounted() {
    this.audios = audios.map(item => item.path)
    this.cards = audios.map(item => ({name: item.name, title: item.chinese, src: item.picture}))

    const selectedName = this.$store.state.backgroundMusic.selected
    if (selectedName === defaultSettings.backgroundMusic.selected) {
      this.currentIndex = this.noneAudioIndex
    } else {
      for (let i = 0; i < this.cards.length; i++) {
        if (this.cards[i].name === selectedName) {
          this.currentIndex = i
          break
        }
      }
    }

    this.realVolume = this.$store.state.backgroundMusic.volume

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
        this.initAudio(this.currentIndex)
        this.sound.play()
      } else {
        this.initAudio(this.currentIndex)
        this.sound.play()
      }
    },
    pauseAudio() {
      if (this.sound) {
        this.sound.pause()
      }
    },
    stopAudio() {
      if (this.sound) this.sound.stop()
    },
    setVolume(vol) {
      if (this.sound) {
        this.realVolume = vol
        this.sound.volume(vol)
        this.$store.commit('SET_BACKGROUND_MUSIC', [this.currentAudioCardName, this.realVolume])
      }
    },
    switchMute() {
      this.muted = !this.muted
      Howler.mute(this.muted)
      if (this.muted) {
        if (this.realVolume === 0) return
        this.prevVolume = this.realVolume
        this.realVolume = 0
        this.setVolume(0)
      } else {
        this.setVolume(this.prevVolume)
      }
    },
    changeAudio(index) {
      if (index === this.currentIndex) {
        if (!this.isPlaying) this.playAudio()
        else this.pauseAudio()
        return
      }
      if (index === this.noneAudioIndex) this.pauseAudio()

      this.currentIndex = index
      this.$store.commit('SET_BACKGROUND_MUSIC', [this.currentAudioCardName, this.realVolume])
      this.playAudio()
    },
    openAudioPanel() {
      this.audioPanel = true
    }
  }
}
</script>

<style lang="sass" scoped>
.active
  opacity: 0.28
</style>

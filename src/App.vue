<template>
  <v-app>
    <v-main>
      <v-fade-transition>
        <keep-alive>
          <router-view />
        </keep-alive>
      </v-fade-transition>
    </v-main>
  </v-app>
</template>

<script>
import hotkeys from 'hotkeys-js'
import shortcuts from '@/common/shortcuts'

export default {
  name: 'App',
  created() {
    this.darkLightAutoSwitch()
    hotkeys(Object.values(shortcuts.global).join(','), (event, handler) => {
      event.preventDefault()
      const getPath = () => window.location.hash.substring(1)
      switch (handler.key) {
        case shortcuts.global.HOME:
          getPath() !== '/' && this.$router.replace('/')
          break
        case shortcuts.global.SETTING:
          getPath() !== '/setting' && this.$router.push('/setting')
          break
        case shortcuts.global.STATISTIC:
          getPath() !== '/statistic' && this.$router.push('/statistic')
          break
      }
    })
  },
  methods: {
    darkLightAutoSwitch() {
      this.$vuetify.theme.dark = window.matchMedia('(prefers-color-scheme: dark)').matches
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', event => {
          this.$vuetify.theme.dark = event.matches
        })
    }
  }
}
</script>

<style lang="sass">
html
  overflow-y: auto
</style>

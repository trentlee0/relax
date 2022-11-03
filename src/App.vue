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
import storage from '@/util/storage'
import {DataKey} from '@/common/constant'
import hotkeys from 'hotkeys-js'
import shortcuts from '@/common/shortcuts'

export default {
  name: 'App',
  created() {
    if (!storage.getSync(DataKey.Visited)) {
      storage.setSync(DataKey.Visited, 1)
      if (storage.getSync(DataKey.Background)) {
        this.$router.push('/help')
        console.log('v1.2 update')
      }
    }

    hotkeys(Object.values(shortcuts.global).join(','), (event, handler) => {
      event.preventDefault()
      switch (handler.key) {
        case shortcuts.global.HOME:
          this.$router.push('/')
          break
        case shortcuts.global.SETTING:
          this.$router.push('/setting')
          break
        case shortcuts.global.STATISTIC:
          this.$router.push('/statistic')
          break
      }
    })

    this.darkLightAutoSwitch()
  },
  methods: {
    darkLightAutoSwitch() {
      const query = '(prefers-color-scheme: dark)'
      this.$vuetify.theme.dark = window.matchMedia(query).matches
      window.matchMedia(query).addEventListener('change', e => this.$vuetify.theme.dark = e.matches)
    }
  }
}
</script>

<style lang="sass">
html
  overflow-y: auto
</style>

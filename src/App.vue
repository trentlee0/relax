<template>
  <v-app>
    <v-main>
      <v-slide-x-transition>
        <keep-alive>
          <router-view />
        </keep-alive>
      </v-slide-x-transition>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  created() {
    this.darkLightAutoSwitch()
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

<style>
html {
  overflow-y: auto;
}
</style>

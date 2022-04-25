<template>
  <v-icon
    v-text="value"
    :color="color"
    :dark="dark"
    :dense="dense"
    :disabled="disabled"
    :large="large"
    :left="left"
    :light="light"
    :right="right"
    :size="size"
    :small="small"
    :x-large="xLarge"
    :x-small="xSmall"
  >
  </v-icon>
</template>

<script>
export default {
  name: 'MyIcon',
  props: {
    color: {
      type: String
    },
    dark: {
      type: Boolean,
      default: false
    },
    dense: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    large: {
      type: Boolean,
      default: false
    },
    left: {
      type: Boolean,
      default: false
    },
    right: {
      type: Boolean,
      default: false
    },
    light: {
      type: Boolean,
      default: false
    },
    size: {
      type: Number | String
    },
    small: {
      type: Boolean,
      default: false
    },
    xLarge: {
      type: Boolean,
      default: false
    },
    xSmall: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      value: ''
    }
  },
  created() {
    this.value = this.$vuetify.icons.values[this.$slots.default[0].text.trim()]
  }
}
</script>

<style scoped>

</style>

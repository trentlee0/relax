<template>
  <v-row class="my-0 justify-center">
    <v-col cols="3">
    </v-col>
    <v-col cols="16" align="center">
      <v-chip
        @click="changeChipEvent({item, index})"
        :color="active === index ? activeColor : ''"
        style="cursor: pointer; user-select: none; margin-left: 5px; margin-right: 5px;"
        v-for="(item, index) in chipTabs"
        :key="item"
      >
        {{ item }}
      </v-chip>
    </v-col>
    <v-col cols="3">
      <slot name="right"></slot>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'ChipTab',
  props: {
    chipTabs: {
      type: Array
    },
    active: {
      type: Number
    },
    activeColor: {
      type: String,
      default: 'primary'
    }
  },
  methods: {
    changeChipEvent(activeItem) {
      this.$emit('change', activeItem)
    }
  }
}
</script>

<style scoped>

</style>

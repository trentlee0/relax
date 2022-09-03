<template>
  <div style="display: flex; vertical-align: center; height: 25px;">
    <div @click="prevClickEvent">
      <MyIcon style="cursor: pointer;">mdi-chevron-left</MyIcon>
    </div>
    <div class="text-caption" style="line-height: 25px; user-select: none;">{{ text }}</div>
    <div @click="nextClickEvent">
      <MyIcon style="cursor: pointer;">mdi-chevron-right</MyIcon>
    </div>
  </div>
</template>

<script>
import MyIcon from '@/components/MyIcon'

export default {
  name: 'SimplePagination',
  components: {MyIcon},
  props: {
    text: {
      type: String,
      default: ''
    }
  },
  methods: {
    prevClickEvent() {
      this.$emit('prevClick')
    },
    nextClickEvent() {
      this.$emit('nextClick')
    }
  }
}
</script>

<style scoped>

</style>

<template>
  <v-btn
    class="mx-2"
    fab
    dark
    large
    fixed
    right
    bottom
    color="primary"
    @click="toTop"
    title="返回顶部"
  >
    <MyIcon dark>
      mdi-arrow-up
    </MyIcon>
  </v-btn>
</template>

<script>
import MyIcon from '@/components/MyIcon'

export default {
  name: 'ToTop',
  components: {MyIcon},
  methods: {
    toTop() {
      scrollTo(0, 0)
    }
  }
}
</script>

<style scoped>

</style>

<template>
  <v-card class="pa-5">
    <v-row>
      <v-col cols="12" md="6">
        <TrendOverview ref="trend"></TrendOverview>
      </v-col>
      <v-col cols="12" md="6">
        <CategoryOverview ref="category"></CategoryOverview>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import CategoryOverview from '@/views/statistic/overview/CategoryOverview'
import TrendOverview from '@/views/statistic/overview/TrendOverview'

export default {
  name: 'Overview',
  components: {TrendOverview, CategoryOverview},
  mounted() {
    this.refreshData()
  },
  methods: {
    refreshData() {
      console.log('overview refresh')
      this.$nextTick(() => {
        this.$refs.trend.refreshData()
        this.$refs.category.refreshData()
      })
    }
  }
}
</script>

<style scoped>

</style>

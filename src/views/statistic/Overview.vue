<template>
  <v-card class="pa-5">
    <v-row>
      <v-col cols="12" md="6">
        <TrendOverview ref="trend"></TrendOverview>
      </v-col>
      <v-col cols="12" md="6">
        <HeatmapOverview ref="heatmap" :is-dark="$vuetify.theme.dark"></HeatmapOverview>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import HeatmapOverview from '@/views/statistic/overview-charts/HeatmapOverview'
import TrendOverview from '@/views/statistic/overview-charts/TrendOverview'

export default {
  name: 'Overview',
  components: {TrendOverview, HeatmapOverview},
  mounted() {
    this.refreshData()
  },
  methods: {
    refreshData() {
      console.log('overview-charts refresh')
      this.$nextTick(() => {
        this.$refs.trend.refreshData()
        this.$refs.heatmap.refreshData()
      })
    }
  }
}
</script>

<style scoped>

</style>

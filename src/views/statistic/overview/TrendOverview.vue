<template>
  <v-card elevation="2">
    <v-card-title>近7天专注</v-card-title>
    <v-card-subtitle>
      <div class="grey--text">
        <MyIcon color="primary">
          mdi-laptop
        </MyIcon>
        <small style="font-size: xx-small;">&nbsp;平均每天</small>
        <strong style="font-size: medium;">{{ minutesAvg }}M</strong>
      </div>
    </v-card-subtitle>
    <v-card-text>
      <v-chart :theme="chartTheme" autoresize :option="option" style="height: 350px"></v-chart>
    </v-card-text>
  </v-card>
</template>

<script>
import MyIcon from '@/components/MyIcon'
import statistics from '@/store/statistics'

export default {
  name: 'TrendOverview',
  components: {MyIcon},
  data() {
    return {
      option: {
        tooltip: {},
        xAxis: {
          data: []
        },
        yAxis: {},
        series: [],
        backgroundColor: 'rgba(0, 0, 0, 0)'
      },
      minutesAvg: 0
    }
  },
  computed: {
    chartTheme() {
      return this.$vuetify.theme.isDark ? 'dark' : ''
    }
  },
  methods: {
    refreshData() {
      statistics.getLast7Day().then(res => {
        const sum = res.data.dailyMinutes.reduce((acc, cur) => acc + cur, 0)
        const length = res.data.dailyMinutes.length - 1
        if (sum && length) this.minutesAvg = Math.ceil(sum / length)

        this.option.xAxis = {
          name: '日期',
          data: res.data.dailyMinuteLabels
        }
        let max = res.data.dailyMinutes.reduce((p, n) => Math.max(p, n))
        this.option.yAxis = {
          type: 'value',
          name: '分钟',
          min: 0,
          max: max <= 5 ? 5 : max
        }
        this.option.series = [{
          name: '日期',
          data: res.data.dailyMinutes,
          type: 'line',
          smooth: true
        }]
      })
    }
  }
}
</script>

<style scoped>

</style>

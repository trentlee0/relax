<template>
  <v-card elevation="2">
    <v-card-title>近七天专注</v-card-title>
    <v-card-subtitle>平均每天 {{ minutesAvg }} 分钟</v-card-subtitle>
    <v-card-text>
      <v-chart
        ref="chart"
        :theme="chartTheme"
        autoresize
        :option="option"
        style="height: 300px"
      ></v-chart>
    </v-card-text>
  </v-card>
</template>

<script>
import MyIcon from '@/components/MyIcon'
import statistics from '@/api/statistics'
import {focusEfficiencyChinese} from '@/common/constant'
import {mapState} from 'vuex'

export default {
  name: 'TrendOverview',
  components: {MyIcon},
  data() {
    return {
      option: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: params => (
            `<div style="display: flex; justify-content: space-between;">
               <div>${params[0].axisValue}</div>
               <div>${params.map(item => item.data).reduce((p, c) => p + c, 0)}</div>
             </div>
             <div style="margin-top: 5px;">
               ${params.map(item =>
              `<div style="display: flex; justify-content: space-between; align-self: center;">
                <div>${item.marker}&nbsp;${item.seriesName}</div>
                <div style="display: inline-block;height: inherit; width: 20px;"></div>
                ${item.data}
              </div>`).join('')}
            </div>`
          )
        },
        legend: {
          show: true
        },
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
    ...mapState({
      enableFocusEfficiency: state => state.settings.general && state.settings.general.enableFocusEfficiency
    }),
    chartTheme() {
      return this.$vuetify.theme.isDark ? 'dark' : ''
    }
  },
  methods: {
    refreshData() {
      statistics.getLast7WorkTime().then(({data}) => {
        this.$refs.chart.clear()
        const sum = data.dailyMinutes.reduce((acc, cur) => acc + cur, 0)
        const length = data.dailyMinutes.length - 1
        if (sum && length) this.minutesAvg = Math.ceil(sum / length)

        this.option.xAxis = {
          name: '日期',
          data: data.dailyMinuteLabels
        }
        let max = data.dailyMinutes.reduce((p, n) => Math.max(p, n))
        this.option.yAxis = {
          type: 'value',
          name: '分钟',
          min: 0,
          max: max <= 5 ? 5 : max
        }

        if (this.enableFocusEfficiency) {
          const items = Object.entries(data.dailyEfficiencyMinutes)
          this.option.legend.show = true
          this.option.series = items.map(item => ({
            type: 'bar',
            stack: 'total',
            name: focusEfficiencyChinese[item[0]],
            data: item[1],
            smooth: true,
            emphasis: {focus: 'series'}
          }))
        } else {
          this.option.legend.show = false
          this.option.series = [{
            name: '日期',
            data: data.dailyMinutes,
            type: 'line',
            smooth: true
          }]
        }
      })
    }
  }
}
</script>

<style scoped>

</style>

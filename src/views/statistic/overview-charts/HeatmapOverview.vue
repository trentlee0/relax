<template>
  <v-card elevation="2">
    <v-card-title>近一年专注</v-card-title>
    <v-card-text>
      <v-chart :theme="chartTheme" autoresize :option="option" style="height: 325px"></v-chart>
    </v-card-text>
  </v-card>
</template>

<script>
import statistics from '@/api/statistics'
import dayjs from 'dayjs'

export default {
  name: 'HeatmapOverview',
  props: {
    isDark: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      option: {
        tooltip: {
          formatter: (params) => `${params.data[1]} 分钟，${params.data[0]}`
        },
        visualMap: {
          min: 0,
          max: 500,
          type: 'piecewise',
          orient: 'horizontal',
          left: 'center',
          top: 65
        },
        backgroundColor: 'rgba(0, 0, 0, 0)',
        gradientColor: [
          // green
          // '#acd9b2',
          // '#4caf50',
          // '#2e7d32',
          // blue
          '#bbdefb',
          '#2196f3',
          '#1565c0'
        ],
        calendar: {
          top: 120,
          left: 30,
          right: 30,
          cellSize: ['auto', 13],
          backgroundColor: 'rgba(0, 0, 0, 0)',
          range: ['2022'],
          itemStyle: {
            borderWidth: 1.7,
            borderColor: this.isDark ? '#1E1E1E' : '#fff',
            color: this.isDark ? '#2b2b2b' : '#f5f5f5'
          },
          splitLine: {
            width: 5,
            lineStyle: {
              color: 'rgba(0, 0, 0, 0)'
            }
          },
          monthLabel: {
            nameMap: 'ZH'
          },
          dayLabel: {
            nameMap: 'ZH'
          }
        },
        series: {
          type: 'heatmap',
          coordinateSystem: 'calendar',
          data: []
        }
      }
    }
  },
  computed: {
    chartTheme() {
      return this.isDark ? 'dark' : ''
    }
  },
  mounted() {
  },
  methods: {
    refreshData() {
      let startDate = dayjs().subtract(1, 'year').startOf('day')
      let endDate = dayjs()
      statistics.getDailyItems('YYYY-MM-DD', startDate.valueOf(), endDate.valueOf()).then(({data}) => {
        const arr = Object.entries(data.data).map(item => [item[0], item[1].workSum])
        this.option.series.data = arr
        this.option.visualMap.max = Math.floor(arr.map(item => item[1]).reduce((p, c) => Math.max(p, c), 0) / 100) * 100
        this.option.calendar.range = [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]
      })
    }
  },
  watch: {
    isDark(newVal) {
      this.option.calendar.itemStyle = {
        borderWidth: 1.7,
        borderColor: newVal ? '#1E1E1E' : '#fff',
        color: newVal ? '#2b2b2b' : '#f5f5f5'
      }
    }
  }
}
</script>

<style scoped>

</style>

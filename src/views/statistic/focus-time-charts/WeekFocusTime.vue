<template>
  <v-chart :theme="chartTheme" autoresize :option="option" style="height: 400px"></v-chart>
</template>

<script>
import dayjs from 'dayjs'
import statistics from '@/store/statistics'
import * as strings from '@/util/strings'

export default {
  name: 'WeekFocusTime',
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
      pagination: {
        text: '',
        pageDate: {}
      },
      offset: 0
    }
  },
  computed: {
    chartTheme() {
      return this.$vuetify.theme.isDark ? 'dark' : ''
    }
  },
  methods: {
    refreshData() {
      statistics.getItemsByWeek(this.offset).then(res => {
        this.option.xAxis = {
          name: '星期',
          data: res.data.details
        }
        let max = res.data.timeRange.reduce((p, n) => Math.max(p, n))
        this.option.yAxis = {
          type: 'value',
          name: '分钟',
          min: 0,
          max: max <= 10 ? 10 : max
        }
        this.option.series = [{
          name: '星期',
          type: 'bar',
          data: res.data.timeRange
        }]
      })
    },
    prev() {
      return this.dateChange(-1)
    },
    next() {
      return this.dateChange(1)
    },
    dateChange(offset) {
      if (this.offset === 0 && offset > 0) return this.pagination.text

      this.offset += offset
      switch (this.offset) {
        case 0:
          this.pagination.text = '本周'
          break
        case -1:
          this.pagination.text = '上周'
          break
        default:
          const monday = dayjs().startOf('week').add(1, 'd').add(this.offset, 'week')
          const sunday = monday.add(6, 'd')
          this.pagination.text = strings.format('%s-%s', monday.format('MM月DD日'), sunday.format('MM月DD日'))
      }
      this.refreshData()
      return this.pagination.text
    }
  }
}
</script>

<style scoped>

</style>

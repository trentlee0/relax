<template>
  <v-chart :theme="chartTheme" autoresize :option="option" style="height: 400px"></v-chart>
</template>

<script>
import statistics from '@/store/statistics'
import dayjs from 'dayjs'

export default {
  name: 'DayFocusTime',
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
        pageDate: dayjs()
      }
    }
  },
  computed: {
    chartTheme() {
      return this.$vuetify.theme.isDark ? 'dark' : ''
    }
  },
  methods: {
    refreshData() {
      let d = this.pagination.pageDate
      statistics.getItemsByDay(d.year(), d.month() + 1, d.date()).then(res => {
        this.option.xAxis = {
          name: '时刻',
          data: res.data.details
        }
        this.option.yAxis = {
          type: 'value',
          min: 0,
          max: 60,
          name: '分钟'
        }
        this.option.series = [{
          name: '时刻',
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
      let t = this.pagination.pageDate.add(offset, 'd')
      if (t.isAfter(dayjs(), 'd')) return this.pagination.text

      this.pagination.pageDate = t
      switch (t.diff(dayjs(), 'd')) {
        case 0:
          this.pagination.text = '今天'
          break
        case -1:
          this.pagination.text = '昨天'
          break
        default:
          this.pagination.text = t.format('MM月DD日')
      }
      this.refreshData()
      return this.pagination.text
    }
  }
}
</script>

<style scoped>

</style>

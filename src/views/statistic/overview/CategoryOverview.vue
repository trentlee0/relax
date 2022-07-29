<template>
  <v-card elevation="2">
    <v-card-title>
      <v-row>
        <v-col>专注统计</v-col>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-col>
          <v-select
            :items="items"
            dense
            v-model:value="item"
            solo
            @change="selectChangeEvent"
          ></v-select>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text>
      <v-chart :theme="chartTheme" autoresize :option="option" style="height: 295px"></v-chart>
    </v-card-text>
  </v-card>
</template>

<script>
import statistics from '@/store/statistics'
import dayjs from 'dayjs'

export default {
  name: 'CategoryOverview',
  data() {
    return {
      option: {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [],
        backgroundColor: 'rgba(0, 0, 0, 0)'
      },
      items: ['今天', '本周', '本月', '今年', '全部'],
      item: '今天',
      actions: {}
    }
  },
  computed: {
    chartTheme() {
      return this.$vuetify.theme.isDark ? 'dark' : ''
    }
  },
  mounted() {
    this.actions = {
      [this.items[0]]: () => ({
        beginStamp: dayjs().startOf('day').valueOf(),
        endStamp: dayjs().endOf('day').valueOf()
      }),
      [this.items[1]]: () => {
        let ws = dayjs().startOf('week')
        ws = dayjs().day() === 0 ? ws.subtract(6, 'day') : ws.add(1, 'day')
        return {
          beginStamp: ws.valueOf(),
          endStamp: ws.add(6, 'day').endOf('day').valueOf()
        }
      },
      [this.items[2]]: () => ({
        beginStamp: dayjs().startOf('month').valueOf(),
        endStamp: dayjs().endOf('month').valueOf()
      }),
      [this.items[3]]: () => ({
        beginStamp: dayjs().startOf('year').valueOf(),
        endStamp: dayjs().endOf('year').valueOf()
      }),
      [this.items[4]]: () => ({})
    }
  },
  methods: {
    refreshData() {
      statistics.getBetween(this.actions[this.item]()).then(res => {
        this.option.series = [
          {
            name: '任务名 - 时长（分钟）',
            type: 'pie',
            radius: '50%',
            data: res.data,
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0)'
            },
            label: {
              show: true,
              formatter: '{b} {d}%'
            },
            labelLine: {show: true}
          }
        ]
      })
    },
    selectChangeEvent() {
      this.refreshData()
    }
  }
}
</script>

<style scoped>

</style>

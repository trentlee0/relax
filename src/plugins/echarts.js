import Vue from 'vue'
import ECharts from 'vue-echarts'
import {use} from 'echarts/core'

import {CanvasRenderer} from 'echarts/renderers'
import {BarChart, PieChart, LineChart, HeatmapChart} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  CalendarComponent
} from 'echarts/components'

use([
  LineChart,
  CanvasRenderer,
  BarChart,
  GridComponent,
  TooltipComponent,
  PieChart,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  CalendarComponent,
  HeatmapChart
])

Vue.component('v-chart', ECharts)

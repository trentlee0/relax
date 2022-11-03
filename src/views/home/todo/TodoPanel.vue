<template>
  <div class="pa-1">
    <v-container style="margin-bottom: 150px;">
      <v-row class="mb-0">
        <v-col cols="4">
          <h2 class="text-h6 font-weight-bold">
            待办事项
          </h2>
        </v-col>
        <v-col cols="8">
          <div class="float-right mr-2">
            <v-avatar
              class="float-right"
              v-if="hasUser"
              color="secondary"
              size="35"
            >
              <img
                alt="avatar"
                draggable="false"
                :src="userInfo.avatar"
              />
            </v-avatar>
            <div class="subtitle-1 float-right font-weight-bold" style="line-height: 35px; margin-right: 5px;">
              <span v-if="hasUser">{{ username }}, </span>
              <span>{{ greeting }}</span>
            </div>
            <div class="caption mt-1 text-right mr-1" style="clear: both;">
              今天专注 {{ todayWorkTimeFormat }}, 休息 {{ todayRestTimeFormat }}
            </div>
          </div>
        </v-col>
      </v-row>

      <v-divider></v-divider>

      <v-expansion-panels
        class="mt-1"
        v-model="expansionPanels"
        multiple
      >
        <v-expansion-panel>
          <v-expansion-panel-header>
            <div>
              <strong>未完成</strong>
              <span class="ml-2">{{ todoTasks.length }}</span>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <TodoList
              :tasks="todoTasks"
              @removeItem="removeTask"
              @updateItem="updateTask"
            >
            </TodoList>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-header>
            <div>
              <strong>已完成</strong>
              <span class="ml-2">{{ doneTasksLen }}</span>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <TodoList
              :tasks="doneTasks"
              @removeItem="removeTask"
              @updateItem="updateTask"
            >
            </TodoList>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-row
        class="my-1 mt-3 mb-3 float-right"
      >
        <v-btn
          class="mr-3"
          color="error"
          icon
          fab
          small
          title="清空已完成任务"
          @click="dialog = true"
        >
          <MyIcon dense>mdi-close-box-multiple</MyIcon>
        </v-btn>
      </v-row>
    </v-container>

    <div class="pr-5 pl-5 input-float">
      <v-sheet
        class="sheet"
        elevation="10"
      >
        <v-text-field
          v-model="newTaskTitle"
          label="打算做什么？"
          solo
          flat
          maxlength="30"
          @keydown.enter="createTask"
          @keydown.esc="$event.target.blur()"
        >
          <template v-slot:append>
            <v-fade-transition>
              <div @click="createTask" style="cursor: pointer;">
                <MyIcon
                  v-show="newTaskTitle"
                  color="primary"
                >
                  mdi-plus-circle
                </MyIcon>
              </div>
            </v-fade-transition>
          </template>
        </v-text-field>
      </v-sheet>
    </div>

    <Dialog
      title="清空所有已完成任务？"
      :show.sync="dialog"
      @confirm="deleteFinishedTasks"
    >
    </Dialog>
  </div>
</template>

<script>
import TodoList from '@/views/home/todo/TodoList'
import todos from '@/api/todos'
import Dialog from '@/components/Dialog'
import MyIcon from '@/components/MyIcon'
import {isUTools} from '@/util/common'
import statistics from '@/api/statistics'

export default {
  name: 'TodoPanel',
  components: {TodoList, Dialog, MyIcon},
  data() {
    return {
      tasks: [],
      newTaskTitle: null,
      expansionPanels: [0],
      dialog: false,
      greeting: null,
      userInfo: null,
      todayWorkTime: 0,
      todayRestTime: 0
    }
  },
  computed: {
    todoTasks() {
      return this.tasks.filter(task => !task.done)
    },
    doneTasks() {
      return this.tasks.filter(task => task.done)
    },
    doneTasksLen() {
      return this.doneTasks.length
    },
    hasUser() {
      return this.userInfo
    },
    username() {
      return this.hasUser ? this.userInfo.username : ''
    },
    avatar() {
      return this.hasUser ? this.userInfo.avatar : ''
    },
    todayWorkTimeFormat() {
      return this.todayWorkTime + ' 分'
    },
    todayRestTimeFormat() {
      return this.todayRestTime + ' 分'
    }
  },
  created() {
    this.initState()
  },
  mounted() {
    this.$bus.$on('start-focus-task', this.startTask)
    this.$bus.$on('remove-task', this.removeTask)
    this.$bus.$on('update-task', this.updateTask)
    this.$bus.$on('checked-task', this.checkedTask)
    this.$bus.$on('open-todo-panel', this.initState)
    this.$bus.$on('drop-todo-item', this.dropTodoItem)
  },
  beforeDestroy() {
    this.$bus.$off('start-focus-task')
    this.$bus.$off('remove-task')
    this.$bus.$off('update-task')
    this.$bus.$off('checked-task')
    this.$bus.$off('open-todo-panel')
    this.$bus.$off('drop-todo-item')
  },
  methods: {
    dropTodoItem({fromIndex, toIndex}) {
      const target = this.tasks[fromIndex]
      const doneTasks = this.doneTasks
      const todoTasks = this.todoTasks
      todoTasks.splice(fromIndex, 1)
      todoTasks.splice(toIndex, 0, target)
      this.tasks = todoTasks.concat(doneTasks)
    },
    initState() {
      todos.list().then(res => this.tasks = res.data || [])

      if (isUTools()) {
        const user = utools.getUser()
        if (user) {
          this.userInfo = {username: user.nickname, avatar: user.avatar}
        }
      }
      this.greeting = this.getGreeting()
      statistics.getToday().then(res => {
        this.todayWorkTime = res.data.todayWorkTime
        this.todayRestTime = res.data.todayRestTime
      })
    },
    getGreeting() {
      switch (new Date().getHours()) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          return '凌晨了'
        case 6:
        case 7:
        case 8:
          return '早晨好'
        case 9:
        case 10:
        case 11:
          return '上午好'
        case 12:
        case 13:
          return '中午好'
        case 14:
        case 15:
        case 16:
        case 17:
          return '下午好'
        case 18:
        case 19:
        case 20:
        case 21:
        case 22:
          return '晚上好'
        case 23:
        case 0:
          return '深夜了'
        default:
          return '你好呀'
      }
    },
    startTask({taskId}) {
      const task = this.tasks.find(task => task.id === taskId)
      if (task) this.$bus.$emit('start-task-timer', task)
    },
    checkedTask({taskId, done}) {
      const task = this.tasks.find(task => task.id === taskId)
      if (task) {
        task.done = done
        task.checkedTime = Date.now()
      }
    },
    createTask() {
      if (!this.newTaskTitle || !this.newTaskTitle.trim()) return
      this.tasks.unshift({id: Date.now(), done: false, title: this.newTaskTitle})
      this.newTaskTitle = null
    },
    removeTask({taskId}) {
      const i = this.tasks.findIndex(task => task.id === taskId)
      if (i !== -1) this.tasks.splice(i, 1)
    },
    updateTask({taskId, taskTitle}) {
      const task = this.tasks.find(task => task.id === taskId)
      if (task) task.title = taskTitle
    },
    deleteFinishedTasks() {
      this.tasks = this.todoTasks
      this.dialog = false
    }
  },
  watch: {
    tasks: {
      deep: true,
      handler(value) {
        todos.replaceAll(value)
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.input-float
  width: 100%
  position: fixed
  bottom: 25px
  right: 0
  z-index: 10

  .sheet
    width: 100%
    height: 40px
    border-radius: 5px
</style>

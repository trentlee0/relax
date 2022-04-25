<template>
  <div class="pa-1">
    <v-container style="margin-bottom: 150px;">
      <h2 class="text-h6 font-weight-bold">
        待办事项
      </h2>

      <v-row
        class="my-1 mt-2 mb-2"
        align="center"
      >
        <span class="ml-4 primary--text">
          <strong>总任务</strong>
          <span class="ml-2">{{ tasks.length }}</span>
        </span>

        <v-spacer></v-spacer>

        <v-progress-circular
          :value="progress"
          size="22"
          width="3"
          class="mr-3"
          color="primary"
        >
        </v-progress-circular>
      </v-row>

      <v-divider></v-divider>

      <v-expansion-panels
        class="mt-1"
        v-model="panels"
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
          title="删除已完成"
          @click="dialog = true"
        >
          <MyIcon>mdi-close-box-multiple</MyIcon>
        </v-btn>
      </v-row>
    </v-container>

    <div class="pr-3 pl-3 input-float">
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
        >
          <template v-slot:append>
            <v-fade-transition>
              <MyIcon
                v-show="newTaskTitle"
                color="primary"
                @click="createTask"
              >
                mdi-plus-circle
              </MyIcon>
            </v-fade-transition>
          </template>
        </v-text-field>
      </v-sheet>
    </div>

    <Dialog
      title="删除所有已完成任务？"
      :show="dialog"
      @confirm="deleteFinishedTasks"
      @cancel="dialog = false"
    >
    </Dialog>
  </div>
</template>

<script>
import TodoList from '@/components/Todo/TodoList'
import todos from '@/store/todos'
import Dialog from '@/components/Dialog'
import MyIcon from '@/components/MyIcon'

export default {
  name: 'TodoPanel',
  components: {TodoList, Dialog, MyIcon},
  data() {
    return {
      tasks: [],
      newTaskTitle: null,
      panels: [0],
      dialog: false
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
    progress() {
      return this.tasks.length ? Math.round(this.doneTasksLen / this.tasks.length * 100) : 100
    }
  },
  created() {
    todos.getAll().then(res => this.tasks = res.data || [])
  },
  mounted() {
    this.$bus.$on('startTask', this.startTask)
    this.$bus.$on('removeTask', this.removeTask)
    this.$bus.$on('updateTask', this.updateTask)
    this.$bus.$on('checkedTask', this.checkedTask)
  },
  beforeDestroy() {
    this.$bus.$off('startTask')
    this.$bus.$off('removeTask')
    this.$bus.$off('updateTask')
    this.$bus.$off('checkedTask')
  },
  methods: {
    startTask({taskId}) {
      for (let i = 0; i < this.tasks.length; i++) {
        if (this.tasks[i].id === taskId) {
          this.$bus.$emit('startTaskTimer', this.tasks[i])
          break
        }
      }
    },
    checkedTask({taskId, done}) {
      for (let i = 0; i < this.tasks.length; i++) {
        if (this.tasks[i].id === taskId) {
          this.tasks[i].done = done
          break
        }
      }
    },
    createTask() {
      if (!this.newTaskTitle || !this.newTaskTitle.trim()) return
      this.tasks.unshift({
        id: Date.now(),
        done: false,
        title: this.newTaskTitle
      })
      this.newTaskTitle = null
    },
    removeTask({taskId}) {
      for (let i = 0; i < this.tasks.length; i++) {
        if (this.tasks[i].id === taskId) {
          this.tasks.splice(i, 1)
          break
        }
      }
    },
    updateTask({taskId, taskTitle}) {
      for (let i = 0; i < this.tasks.length; i++) {
        if (this.tasks[i].id === taskId) {
          this.tasks[i].title = taskTitle
          break
        }
      }
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
        todos.saveAll(value)
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.input-float
  width: 100%
  position: fixed
  bottom: 20px
  right: 0
  z-index: 10

  .sheet
    width: 100%
    height: 50px
    border-radius: 5px
</style>

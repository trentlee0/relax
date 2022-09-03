import storage, {Msg} from '@/util/storage'
import {DataKey} from '@/common/constant'

class TodoStore {
  getByTaskName(taskName) {
    return new Promise((resolve, reject) => {
      this.list().then(res => {
        const tasks = res.data || []
        const task = tasks.find(task => task.title === taskName && !task.done)
        resolve(Msg.instance(task))
      }).catch(reject)
    })
  }

  addFirst(task) {
    return new Promise((resolve, reject) => {
      this.list().then(res => {
        const tasks = res.data || []
        const index = tasks.findIndex(item => !item.done && item.title === task)
        if (index === -1) tasks.unshift(task)
        this.cover(tasks).then(resolve).catch(reject)
      }).catch(reject)
    })
  }

  list() {
    return storage.get(DataKey.Todo)
  }

  cover(tasks) {
    return storage.set(DataKey.Todo, tasks)
  }
}

export default new TodoStore()

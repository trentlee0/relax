import storage, {Msg} from '@/util/storage'
import {DataKey} from '@/common/constant'

export class Task {
  /**
   * @type {number}
   */
  id
  /**
   * @type {boolean}
   */
  done
  /**
   * @type {string}
   */
  title
  /**
   * @type {number}
   */
  checkedTime

  constructor(title) {
    this.id = Date.now()
    this.title = title
    this.done = false
  }
}

class TodoStore {
  /**
   * @param {string} taskName
   * @return {Promise<Msg>}
   */
  getByTaskName(taskName) {
    return new Promise((resolve, reject) => {
      this.list().then(res => {
        const tasks = res.data || []
        const task = tasks.find(task => task.title === taskName && !task.done)
        resolve(Msg.instance(task))
      }).catch(reject)
    })
  }

  /**
   * @param {Task} task
   * @return {Promise<Msg>}
   */
  addFirst(task) {
    return new Promise((resolve, reject) => {
      this.list().then(res => {
        const tasks = res.data || []
        const index = tasks.findIndex(item => !item.done && item.title === task)
        if (index === -1) tasks.unshift(task)
        this.replaceAll(tasks).then(resolve).catch(reject)
      }).catch(reject)
    })
  }

  /**
   * @return {Promise<Msg>}
   */
  list() {
    return storage.get(DataKey.Todo)
  }

  /**
   * @param {Array<Task>} tasks
   * @return {Promise<Msg>}
   */
  replaceAll(tasks) {
    return storage.set(DataKey.Todo, tasks)
  }
}

export default new TodoStore()

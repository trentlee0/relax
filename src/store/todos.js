import {isUTools} from '@/util/platforms'
import {Storage, BrowserStorage, UToolsStorage} from '@/store/storage'
import {dataKey} from '@/config/constants'

class Todo {
  /**
   * @type {Storage}
   */
  storage

  constructor(storage) {
    this.storage = storage
  }

  static _instance

  static instance(storage) {
    if (!this._instance) {
      this._instance = new Todo(storage)
    }
    return this._instance
  }

  getAll() {
    return this.storage.get(dataKey.Todo)
  }

  saveAll(tasks) {
    return this.storage.set(dataKey.Todo, tasks)
  }
}

export default Todo.instance(
  isUTools() ? new UToolsStorage() : new BrowserStorage()
)

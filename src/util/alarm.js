class PriorityQueue {
  /**
   * @param {(a: any, b: any) => number} compareFn
   */
  constructor(compareFn = (a, b) => a - b) {
    this.elements = []
    this.compareFn = compareFn
    this.init()
  }

  init() {
    let lastParentNodeIndex = Math.floor(this.elements.length / 2) - 1
    for (let i = lastParentNodeIndex; i >= 0; i--) {
      this.buildChildNodes(i)
    }
  }

  buildChildNodes(index) {
    let arr = this.elements
    let left = index * 2 + 1
    let right = index * 2 + 2
    let maxIndex = index
    let length = arr.length

    if (left < length && this.compareFn(arr[left], arr[maxIndex]) > 0) {
      maxIndex = left
    }

    if (right < length && this.compareFn(arr[right], arr[maxIndex]) > 0) {
      maxIndex = right
    }

    if (maxIndex !== index) {
      this.swap(index, maxIndex)
      this.buildChildNodes(maxIndex)
    }
  }

  peak() {
    if (this.isEmpty()) return undefined
    return this.elements[0]
  }

  push(val) {
    this.elements.push(val)
    this.init()
  }

  pop() {
    if (this.size() <= 1) return this.elements.pop()
    let val = this.elements[0]
    this.elements[0] = this.elements.pop()
    this.init()
    return val
  }

  sort() {
    let res = []
    let length = this.elements.length
    for (let i = 0; i < length; i++) {
      res.push(this.pop())
    }
    this.elements = res
    return res
  }

  swap(i, j) {
    let tmp = this.elements[i]
    this.elements[i] = this.elements[j]
    this.elements[j] = tmp
  }

  remove(i) {
    this.elements.splice(i, 1)
  }

  clear() {
    this.elements.splice(0, this.size())
  }

  size() {
    return this.elements.length
  }

  getElements() {
    return this.elements
  }

  isEmpty() {
    return this.size() === 0
  }
}


export class AlarmTask {
  static increment = 0

  constructor({time, action}) {
    this.taskId = AlarmTask.increment++
    this.time = time
    this.action = action
  }
}

class Alarm {
  /**
   * @type {PriorityQueue}
   */
  queue
  timer

  constructor() {
    this.queue = new PriorityQueue((a, b) => b.time - a.time)
  }

  /**
   * @param  {Array<{time: number, action: function(): void}>} tasks
   * @return {Array<AlarmTask>}
   */
  start(tasks) {
    this.break()
    const res = []
    for (let task of tasks) {
      const item = new AlarmTask(task)
      res.push(item)
      this.queue.push(item)
    }
    this.init()
    return res
  }

  stop(taskIds) {
    this.break()
    for (let id of taskIds) {
      const tasks = this.queue.getElements()
      for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].taskId === id) {
          this.queue.remove(i)
          break
        }
      }
    }
    this.init()
  }

  init() {
    if (this.queue.isEmpty()) return

    this.timer = setInterval(() => {
      let peak = this.queue.peak()
      while (peak && peak.time <= Date.now()) {
        peak.action()
        this.queue.pop()
        peak = this.queue.peak()
      }
      if (this.queue.isEmpty()) this.break()
    }, 1000)
  }

  break() {
    clearInterval(this.timer)
  }

  exit() {
    this.break()
    this.queue.clear()
  }
}

export default new Alarm()

class Queue {
  constructor() {
    this.queues = {};
    this.processing = {};
  }
  add(userId, item) {
    if (!this.queues[userId]) {
      this.queues[userId] = [];
      this.processing[userId] = false;
    }
    this.queues[userId].push(item);
  }
  first(userId) {
    return this.queues[userId]?.[0] || null;
  }
  delete(userId) {
    if (this.queues[userId]) {
      this.queues[userId].shift();
      if (this.queues[userId].length === 0) {
        delete this.queues[userId];
        delete this.processing[userId];
      }
    }
  }
  isEmpty(userId) {
    return !this.queues[userId] || this.queues[userId].length === 0;
  }
  async processQueue(userId, callback) {
    if (this.processing[userId] || this.isEmpty(userId)) return;
    this.processing[userId] = true;
    while (!this.isEmpty(userId)) {
      const currentItem = this.first(userId);
      try {
        await callback(currentItem);
        this.delete(userId);
      } catch (error) {
        console.error(`Error processing queue item for user ${userId}:`, error);
        break;
      }
    }

    this.processing[userId] = false;
  }
}

module.exports = Queue;

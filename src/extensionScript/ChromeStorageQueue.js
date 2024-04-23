export class ChromeStorageQueue {
    constructor(storageKey) {
      this.storageKey = storageKey;
    }
  
    async getStorage() {
      try {
        const data = await chrome.storage.local.get(this.storageKey);
        return data[this.storageKey] || []; // Return empty array if key doesn't exist
      } catch (error) {
        console.error("Error getting data from storage:", error);
        return []; // Return empty array on error
      }
    }
  
    async setStorage(data) {
      try {
        await chrome.storage.local.set({ [this.storageKey]: data });
      } catch (error) {
        console.error("Error saving data to storage:", error);
      }
    }
  
    async addtoQueue(item) {
      const queue = await this.getStorage();
      queue.push(item);
      await this.setStorage(queue);
    }
  
    async pullFromQueue() {
      // Ensure queue is not empty before removing
      const queue = await this.getStorage();
      if (queue.length === 0) {
        return null; // Return null if queue is empty
      }
      const removedItem = queue.shift();
      await this.setStorage(queue);
      return removedItem;
    }
  
    async removeFromQue() {
      // Consider if immediate removal or waiting for next poll is desired
      return await this.pullFromQueue(); // Remove using pullFromQueue for consistency
    }
  
    async removeAll() {
      await this.setStorage([]);
    }
  
    async addBulk(items) {
      const queue = await this.getStorage();
      queue.push(...items); // Spread operator for efficient addition
      await this.setStorage(queue);
    }
  }
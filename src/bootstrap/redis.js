const { createClient } = require("redis");

class Redis {
  constructor(password, host, port) {
    this.client = createClient({
      password,
      socket: {
        host,
        port,
      },
    });

    this.client.on("error", (err) => {
      console.log("Redis Client Error", err);
    });

    this.connectionPromise = this.client.connect();
  }

  async set(key, value, ttl = 3600) {
    try {
      await this.connectionPromise;
      await this.client.set(key, JSON.stringify(value), { EX: ttl });
    } catch (error) {
      console.error("Failed to set value in Redis", error);
    }
  }

  async get(key) {
    try {
      await this.connectionPromise;
      return JSON.parse(await this.client.get(key));
    } catch (error) {
      console.error("Failed to get value from Redis", error);
      return null;
    }
  }

  async delete(key) {
    try {
      await this.connectionPromise;
      await this.client.del(key);
    } catch (error) {
      console.error("Failed to delete value from Redis", error);
    }
  }

  async close() {
    try {
      await this.connectionPromise;
      await this.client.quit();
      console.log("Redis client disconnected");
    } catch (error) {
      console.error("Failed to disconnect Redis client", error);
    }
  }
}

module.exports = Redis;

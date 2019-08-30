export default class {
  constructor (redis) {
    this.redis = redis;
    this.client = undefined;
  }

  async connect (redisConfig) {
    try {
      this.client = await this.redis.createClient({
        ...redisConfig,
        retry_strategy: function (options) {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('The server refused the connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });
      if (this.client) {
        this.client.flushall();
        console.log('Redis Successfully Connected');
        return this;
      }
    } catch (e) {
      console.log('Error to Connect Redis: ', e);
    }
    return false;
  }

  getClient () {
    return this.client;
  }

  async get ({ folder, key }, callback) {
    const client = this.client;
    if (client) {
      if (folder) key = folder + ':' + key;

      const value = await new Promise(resolve => {
        client.get(key, (err, val) => {
          if (err) resolve(false);
          resolve(val);
        });
      });
      if (value) return JSON.parse(value);
    }
    const { value, expire } = await callback();
    this.set({ key, value, expire });
    return value;
  }

  async set ({ folder, key, value, expire }) {
    if (this.client) {
      if (folder) key = folder + ':' + key;
      if (expire) this.client.set(key, JSON.stringify(value), 'EX', expire);
      else this.client.set(key, JSON.stringify(value));
    }
    return true;
  }

  deleteKey ({ folder, key }) {
    if (folder) key = folder + ':' + key;
    this.client.del(key);
  }
}

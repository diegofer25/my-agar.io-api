export default class {
  constructor (io, socketIoRedis) {
    this.io = io;
    this.socketIoRedis = socketIoRedis;
  }

  connect (redisConfig) {
    this.io.adapter(this.socketIoRedis(redisConfig));
    console.log('Socket.io Successfully Started');
    return this.io;
  }
}

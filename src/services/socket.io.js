export default class {
  constructor (io, socketIoRedis) {
    this.io = io;
    this.socketIoRedis = socketIoRedis;
  }

  connect (redisConfig) {
    this.io.adapter(this.socketIoRedis(redisConfig));
    this.handlerPlayersConnection();
    console.log('Socket.io Successfully Started');
    return this;
  }

  handlerPlayersConnection() {
    this.io.on('connection', (socket) => {
      this.io.emit('addPlayerStatistic', socket.id);
      socket.on('disconnecting', () => {
        this.io.emit('removePlayerStatistic', socket.id);
      });
    });
  }
}

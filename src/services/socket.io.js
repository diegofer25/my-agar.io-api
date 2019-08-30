export default class {
  constructor (io, socketIoRedis) {
    this.io = io;
    this.socketIoRedis = socketIoRedis;
    this.rooms = [];
    this.players = [];
  }

  connect (redisConfig) {
    this.io.adapter(this.socketIoRedis(redisConfig));
    this.handlerPlayersConnection();
    console.log('Socket.io Successfully Started');
    return this;
  }

  handlerPlayersConnection() {
    this.io.on('connection', (socket) => {
      this.players.push(socket.id);
      socket.on('disconnecting', () => {
        this.players = this.players.filter(p => p !== socket.id);
      });
    });
  }
}

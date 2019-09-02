export default class GameService {
  constructor (db, redis, socket) {
    this.db = db;
    this.redis = redis;
    this.socket = socket;
    this.players = [];
    this.room = 'game';
  }

  start () {
    this.socket.on('connection', (socket) => {
      console.log(`${socket.id} connected`);

      socket.join(this.room);
      this.socket.emit('addPlayerStatistic', socket.id);
      this.createPlayer(socket.id);

      socket.on('disconnecting', () => {
        this.removePlayer(socket.id);
        this.socket.emit('removePlayerStatistic', socket.id);
        socket.leave(this.room);

        console.log(`${socket.id} disconnected`);
      });
    });
    return this;
  }

  createPlayer (id) {
    this.players.push({
      id,
      position: [0, 0],
      length: 10
    });
    this.socket.to(this.room).emit('updatePlayers', this.players);
  }

  removePlayer (id) {
    this.players = this.players.filter(player => player.id !== id);
    this.socket.to(this.room).emit('removePlayer', id);
  }
}

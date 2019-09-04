import { Player } from '../utils';

export default class GameService {
  constructor (id, db, redis, socket) {
    this.db = db;
    this.redis = redis;
    this.socket = socket;
    this.players = [];
    this.configs = {
      id,
      loopTime: 30,
      room: `room-${id}`,
      mapSize: {
        width: 1000,
        height: 1000
      }
    };
  }

  start () {
    this.socket.on('connection', (socket) => {
      console.log(`${socket.id} connected`);

      socket.join(this.configs.room);
      this.socket.emit('addPlayerStatistic', socket.id);
      this.createPlayer(socket.id);

      socket.on('player-move', ({ id, position }, confirmation) => {
        this.players = this.players.map(player => {
          if (player.id === id) {
            if (player.new) player.new = false;
            player.move(position);
            confirmation();
          }
          return player;
        });
      });

      socket.on('disconnecting', () => {
        this.removePlayer(socket.id);
        console.log(`${socket.id} disconnected`);
      });
    });

    setInterval(() => {
      this.socket.to(this.configs.room).emit('gameUpdate', {
        players: this.players
      });
    }, this.configs.loopTime);
    return this;
  }

  createPlayer (id) {
    this.players.push(new Player({
      id,
      position: [500, 500],
      length: 12,
      speed: 5
    }));
    this.socket.to(this.configs.room).emit('updatePlayers', this.players);
  }

  removePlayer (id) {
    this.players = this.players.filter(player => player.id !== id);
    this.socket.to(this.configs.room).emit('removePlayer', id);
    this.socket.emit('removePlayerStatistic', id);
  }
}

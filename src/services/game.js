import { Player } from '../utils';

export default class GameService {
  constructor (id, db, redis, socket) {
    this.db = db;
    this.redis = redis;
    this.socket = socket;
    this.players = [];
    this.foods = [];
    this.configs = {
      id,
      loopTime: 33.3,
      room: `room-${id}`,
      mapSize: {
        width: 4000,
        height: 4000
      }
    };
  }

  start () {
    this.socket.on('connection', (socket) => {
      console.log(`${socket.id} connected`);

      socket.join(this.configs.room);
      this.socket.emit('addPlayerStatistic', socket.id);
      this.createPlayer(socket.id);

      socket.on('player-move', (direction) => {
        this.players = this.players.map(player => {
          if (player.id === socket.id) {
            if (player.new) player.new = false;
            player.move(direction);
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
      this.checkCollisons(this.players.length);
      this.generateFood();
      this.socket.to(this.configs.room).emit('gameUpdate', {
        players: this.players.map(p => p.toClient),
        foods: this.foods
      });
    }, this.configs.loopTime);
    return this;
  }

  createPlayer (id) {
    this.players.push(new Player({
      id,
      position: [0, 0],
      mass: 100
    }));
    this.socket.to(this.configs.room).emit('updatePlayers', this.players);
  }

  removePlayer (id) {
    this.players = this.players.filter(player => player.id !== id);
    this.socket.to(this.configs.room).emit('removePlayer', id);
    this.socket.emit('removePlayerStatistic', id);
  }

  checkCollisons (playersLength) {
    for (let i = 0; i < playersLength; i++) {
      if (this.players[i].live) {
        // check collision with players
        for (let y = 0; y < playersLength; y++) {
          if (
            this.players[y].live &&
            this.players[i].id !== this.players[y].id && // check if is a enemy or the iteration player
            this.players[i].mass > this.players[y].mass && // player mass gretter than collider
            this.players[i].position.distance(this.players[y].position) - ((this.players[i].radius * 2) - this.players[y].radius * 2) <= 0 // collider inside the player
          ) {
            this.players[i].eat( this.players[y].mass);
            this.players[y].die();
          }
        }
        // check collision with foods
        for (let x = 0; x < this.foods.length; x++) {
          if (
            this.players[i].mass > this.foods[x].mass && // player mass gretter than collider
            this.players[i].position.distance(this.foods[x].position) - ((this.players[i].radius * 2) - this.foods[x].radius * 2) <= 0 // collider inside the player
          ) {
            this.players[i].eat( this.players[x].mass);
            this.foods.splice(x, 1);
            x--;
          }
        }
      }
    }
  }

  generateFood () {
    if (this.foods.length < 400) {
      this.foods.push(new Player({
        position: [
          Math.floor(Math.random() * this.configs.mapSize.width) - (this.configs.mapSize.width / 2),
          Math.floor(Math.random() * this.configs.mapSize.height) - (this.configs.mapSize.height / 2)
        ],
        mass: 10
      }).toClient);
    }
  }
}

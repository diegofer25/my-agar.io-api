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
      loopTime: 1000 / 60,
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
            player.move(direction, this.configs.mapSize);
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
      this.checkCollisons(this.players, this.foods);
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
      type: 'player',
      id,
      position: [
        Math.floor(Math.random() * (this.configs.mapSize.width - 100)) - ((this.configs.mapSize.width / 2) - 100),
        Math.floor(Math.random() * (this.configs.mapSize.height - 100)) - ((this.configs.mapSize.height / 2) - 100)
      ],
      mass: 100
    }));
    this.socket.to(this.configs.room).emit('updatePlayers', this.players);
  }

  removePlayer (id) {
    this.players = this.players.filter(player => player.id !== id);
    this.socket.to(this.configs.room).emit('removePlayer', id);
    this.socket.emit('removePlayerStatistic', id);
  }

  checkCollisons (players, foods) {
    players.forEach((player, index, enemies) => {
      enemies.forEach(enemy => {
        if (
          player.live && enemy.live &&
          player.id !== enemy.id && // check if is a enemy or the iteration player
          player.mass > enemy.mass && // player mass gretter than collider
          player.position.distance(enemy.position) - ((player.diameter) - enemy.diameter) <= 0 // collider inside the player
        ) {
          player.chew(enemy.mass);
          enemy.die();
        }
      });

      this.foods = foods.filter(food => {
        if (
          player.mass > food.mass && // player mass gretter than collider
          player.position.distance(food.position) - ((player.radius * 2) - food.radius * 2) <= 0 // collider inside the player
        ) {
          player.eat(food.mass);
          return false;
        }
        return true;
      });
    });
  }

  generateFood () {
    if (this.foods.length < 800) {
      this.foods.push(new Player({
        type: 'food',
        position: [
          Math.floor(Math.random() * (this.configs.mapSize.width - 10)) - ((this.configs.mapSize.width / 2) - 10),
          Math.floor(Math.random() * (this.configs.mapSize.height - 10)) - ((this.configs.mapSize.height / 2) - 10)
        ],
        mass: 10
      }).toClient);
    }
  }
}

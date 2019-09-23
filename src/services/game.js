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
      console.log(`${socket.id} connected at ${this.configs.room}`);

      socket.join(this.configs.room);
      this.socket.emit('addPlayerStatistic', socket.id);
      this.createPlayer(socket.id, socket.handshake.query);

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
      this.players = this.checkCollisons();
      this.generateFood();
      this.socket.to(this.configs.room).emit('gameUpdate', {
        players: this.players.map(p => p.toClient),
        foods: this.foods.map(f => f.toClient)
      });
    }, this.configs.loopTime);
    return this;
  }

  createPlayer (id, { name, color }) {
    this.players.push(new Player({
      id,
      name,
      color,
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

  checkCollisons () {
    return this.players.map(player => {

      player = this.checkFoodColision(player);

      return this.checkPlayersColision(player);
    });
  }

  checkPlayersColision (player) {
    this.players = this.players.map(enemy => {
      if (
        player.live && enemy.live &&
        player.id !== enemy.id && // check if is a enemy or the iteration player
        player.mass > enemy.mass && // player mass gretter than collider
        player.position.distance(enemy.position) - ((player.diameter) - enemy.diameter) <= 10 // collider inside the player
      ) {
        player.chew(enemy.mass);
        enemy.kill();
      }
      return enemy;
    });
    return player;
  }

  checkFoodColision (player) {
    this.foods = this.foods.filter(food => {
      if (
        player.mass > food.mass && // player mass gretter than collider
        player.position.distance(food.position) - ((player.diameter) - food.diameter) <= 10 // collider inside the player
      ) {
        player.eat(food.mass);
        return false;
      }
      return true;
    });
    return player;
  }

  generateFood () {
    if (this.foods.length < 800) {
      this.foods.push(new Player({
        position: [
          Math.floor(Math.random() * (this.configs.mapSize.width - 50)) - ((this.configs.mapSize.width / 2) - 50),
          Math.floor(Math.random() * (this.configs.mapSize.height - 50)) - ((this.configs.mapSize.height / 2) - 50)
        ],
        mass: 10
      }));
    }
  }

  getPlayer (id) {
    return this.players.find(player => player.id === id) || {};
  }

  revivePlayer (id) {
    this.players = this.players.map(player => {
      if (player.id === id) {
        const { width, height } = this.configs.mapSize;
        player.randomizePosition(width, height);
        player.revive();
      }
      return player;
    });
  }
}

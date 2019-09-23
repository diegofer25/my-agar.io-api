import http from 'http';
import url from 'url';
import mongodb from 'mongodb';
import redis from 'redis';
import socketIo from 'socket.io';
import socketIoRedis from 'socket.io-redis';

import mongoDbConnection from './services/mongodb';
import RedisService from './services/redis';
import SocketIoService from './services/socket.io';
import GameService from './services/game';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || undefined,
  password: process.env.REDIS_PASSWORD || undefined
};

export default class {
  constructor (port) {
    this.port = port;
    this.services = {};
  }

  async start (processId) {
    this.services = await this.initializeServices(processId);

    const serverHandler = this.serverHandler.bind(this);
    this.server = http.createServer(serverHandler);

    this.createDbIndexs(this.services.db);

    this.server.listen(this.port, () => {
      console.log(`Server listening on: http://localhost:${this.port}/ - Worker ${processId} started`);
    });
  }

  async initializeServices(processId) {
    const db = await mongoDbConnection(mongodb);

    const redisService = await new RedisService(redis).connect(redisConfig);

    const socket = new SocketIoService(socketIo(5000), socketIoRedis).connect(redisConfig, db);

    const game = new GameService(processId, db, redis, socket).start();

    return {
      redis: redisService,
      db,
      socket,
      game
    };
  }

  async serverHandler (request, response) {
    const { req, res } = await this.prepareRequestResponse(request, response);

    if (req.path.includes('/api/')) {
      try {
        const file = req.path.split('/')[2];
        const entry = req.path.split('/')[3];

        const module = await import(`./api/routes/${file}`);

        const api = module[req.method][entry];
        api(req, res, this.services);
      } catch (e) {
        console.log(e.message);
        res.sendStatus(404);
      }
    } else if (req.path === '/' && req.method === 'GET') {
      res.end('Web Game API is ON');
    } else {
      res.sendStatus(404);
    }
  }

  async prepareRequestResponse (req, res) {
    var { pathname, query } = url.parse(req.url, true);
    return {
      req: {
        ...req,
        query,
        body: await this.getBody(req),
        path: pathname
      },
      res: this.setResponse(req, res)
    };
  }

  setResponse (req, res) {
    res.redirect = (newPath) => {
      res.writeHead(301,
        {Location: `http://${req.headers.host + newPath}`}
      );
      res.end();
    };
    res.json = (json) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(json));
    };
    res.sendStatus = (status, message = '') => {
      res.writeHead(status);
      res.end(message);
    };
    return res;
  }

  getBody (request) {
    return new Promise(resolve => {
      if (request.method === 'POST') {
        let body = '';
        request.on('data', chunk => {
          body += chunk.toString();
        });
        request.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve({ error: e.message });
          }
        });
      } else {
        resolve({});
      }
    });
  }

  createDbIndexs (db) {
    db.collection('players').createIndex({ username: 'text' });
  }
}

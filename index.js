import cluster from 'cluster';
import os from 'os';
import Server from './src/http-server';


const numCPUs = os.cpus().length;

(async () => {
  if (process.env.PRODUCTION) {
    if (cluster.isMaster) {
      process.on('SIGHUP', function () {
        for (const worker of Object.values(cluster.workers)) {
          worker.process.kill('SIGTERM');
        }
      });

      console.log(`Master ${process.pid} is running`);

      // Fork workers.
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('exit', (worker, /*code, signal*/) => {
        console.log(`worker ${worker.process.pid} died`);
      });
    } else {
      process.on('SIGHUP', function() {});

      const server = new Server(process.env.PORT || 4000);
      server.start(process.pid);
    }
  } else {
    const server = new Server(process.env.PORT || 4000);
    server.start(process.pid);
  }
})();

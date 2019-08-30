import cluster from 'cluster';
import os from 'os';
import Server from './src/http-server';


const numCPUs = os.cpus().length;

(async () => {
  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, /*code, signal*/) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  } else {
    const server = new Server(process.env.PORT || 4000);
    server.start(process.pid);
  }
})();

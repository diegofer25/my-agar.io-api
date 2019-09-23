import Server from './src/http-server';

new Server(process.env.PORT || 4000).start(process.pid);

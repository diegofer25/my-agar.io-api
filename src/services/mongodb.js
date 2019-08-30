export default ({ MongoClient }) => {
  return new Promise((resolve, reject) => {
    const stringConnection = process.env.STRING_CONNECTION || 'mongodb://localhost:27017/purrinha';
    MongoClient.connect(stringConnection, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, client) {
      if (err) {
        reject(err);
      } else {
        console.log('MongoDB Successfully Connected');
        resolve(client.db());
      }
    });
  });
};

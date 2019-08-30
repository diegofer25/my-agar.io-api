export const title = async (req, res, { db, redis, socket }) => {
  console.log(socket.players);
  try {
    const player = await redis.get({ folder: 'players', key: 'diego' }, async () => {
      return {
        value: await db.collection('players').findOne({ username: 'Diego' })
      };
    });

    res.json({
      title: 'Hello World from API',
      players: [player]
    });

  } catch (error) {
    res.sendStatus(500);
  }
};

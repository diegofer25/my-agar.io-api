export const getStatistics = async (req, res, { socket }) => {

  try {
    const playersCount = Object.keys(socket.sockets.sockets).length;
    const roomsCount = socket.sockets.rooms.length;

    res.json({ playersCount, roomsCount });

  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
  }
};

export const playAgain = async (req, res, { game }) => {
  const { id } = req.query;
  try {
    if (!game.getPlayer(id).live) {
      game.revivePlayer(id);
      res.sendStatus(200);
    } else {
      res.json({ error: 'Player is not die' });
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

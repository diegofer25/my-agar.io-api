export const getStatistics = async (req, res, { socket }) => {

  try {
    const playersCount = Object.keys(socket.io.sockets.sockets).length;
    const roomsCount = socket.io.sockets.rooms.length;

    res.json({ playersCount, roomsCount });

  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
  }
};

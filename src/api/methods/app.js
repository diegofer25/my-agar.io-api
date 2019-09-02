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

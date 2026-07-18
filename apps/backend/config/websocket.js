const { WebSocketServer } = require("ws");

const clients = new Set();
let wordOfTheDay = null;

function initWebSocket(server) {
  const wss = new WebSocketServer({ server, path: "/ws" });
  console.log("websocket");
  wss.on("connection", (socket) => {
    console.log("Client connected");
    clients.add(socket);

    if (wordOfTheDay) {
      socket.send(
        JSON.stringify({ type: "word_of_the_day", payload: wordOfTheDay }),
      );
    }

    socket.on("close", () => clients.delete(socket));
  });
}

function setWordOfTheDay(word) {
  wordOfTheDay = word;
}

function broadcast(data) {
  const message = JSON.stringify({ type: "word_of_the_day", payload: data });

  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(message);
    }
  }
}

module.exports = { initWebSocket, broadcast, setWordOfTheDay };

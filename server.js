const express = require("express");
const http = require("http");
const cors = require('cors');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
	cors: {
	  origin: "*",
	  methods: ["GET", "POST"]
	}
  });

// Remova ou ajuste estas linhas conforme necessário
// app.use(cors({
//   origin: 'http://myspacelogy.sytes.net',
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true,
// }));

// Remova ou ajuste esta middleware conforme necessário
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'http://myspacelogy.sytes.net');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// });

let idPsicologo;

io.on("connection", (socket) => {
	socket.emit("me", socket.id);

	socket.on("user", (userType) => {
		if (userType === "psicologo") {
			idPsicologo = socket.id;
			console.log(`Olha o psicologo ${idPsicologo}`);
		} else {
			console.log(`Olha o paciente`);
			socket.emit("paciente", idPsicologo);
		}
	});

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded");
	});

	socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name });
	});

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal, data.horaInicio);
	});
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

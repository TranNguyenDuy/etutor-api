import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import fileUpload from "express-fileupload";
import { createServer } from "http";
import socketio, { Socket } from 'socket.io';
import { AppConfigs } from "./configs";
import { routes } from "./routes";
import { Schedule } from "./schedule";
import { EmailService } from "./services/email-service";
import { SocketManager } from "./socket";

const app = express();


app.use(fileUpload());
app.use(
  cors({
    origin: AppConfigs.CLIENT_ORIGIN,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(bodyParser.json());

app.use(routes);
app.use((err, req: Request, res: Response, next: NextFunction) => {
  if (res.finished) return;
  if (err) {
    return res.status(err.message ? 400 : 500).json({
      error_message: err.message || JSON.stringify(err),
    });
  }
  res.sendStatus(204);
});

app.options('*', (req, res) => {
  res.sendStatus(204);
});
const http = createServer(app);
const io = socketio(http);

io.on('connection', (socket: Socket) => {
  console.log(`Socket ${socket.id} connected`);
  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);
    SocketManager.remove(socket.id);
  });
  socket.on('init', userId => {
    SocketManager.push(socket, userId);
  });
});

const startup = async () => {
  try {
    await EmailService.init();
    Schedule.run();
  } catch (error) {
    console.error(error);
    Schedule.cancel();
  }
};

export const startServer = () =>
  http.listen(AppConfigs.PORT, () => {
    console.log("Server is running on port:", AppConfigs.PORT);
    startup();
  });

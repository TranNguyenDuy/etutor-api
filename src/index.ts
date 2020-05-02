import "reflect-metadata";
import { startServer } from "./app";
import { DbContext } from "./database";
import { Schedule } from "./schedule";

process.on('exit', () => {
  DbContext.disconnect();
  Schedule.cancel();
});

DbContext.connect()
  .then(() => {
    startServer();
  })
  .catch(error => {
    console.error(error);
    DbContext.disconnect();
    Schedule.cancel();
  });

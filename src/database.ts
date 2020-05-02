import { Connection, createConnection } from "typeorm";

let _connection: Connection;

async function connect() {
  _connection = await createConnection();
}

async function disconnect() {
  if (!_connection) return;
  await _connection.close();
}

const getConnection = () => {
  if (!_connection) {
    console.error(new Error("Cannot get DB connection"));
    process.exit(1);
  }
  return _connection;
};

export const DbContext = {
  connect,
  disconnect,
  getConnection
};

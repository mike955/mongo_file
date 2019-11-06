import * as mongoose from "mongoose";

let _connectMap: { [key: string]: mongoose.Connection } = {};

function getMongoConnection(key) {
  if (_connectMap[key] === undefined) {
    const mongo_cfg = require("../../conf/mongo");
    const host = mongo_cfg.host;
    const port = mongo_cfg.port;
    const user = mongo_cfg.user;
    const password = mongo_cfg.password;
    const database = mongo_cfg.database;
    const uri = `mongodb://${host}:${port}/${database}`;
    _connectMap[key] = mongoose.createConnection(uri, {
      server: { poolSize: 10 },
      auth: { user, password }
    });
  }
}

export default {
  getMongoConnection
};

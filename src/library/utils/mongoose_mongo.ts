import * as mongoose from "mongoose";

let _connectMap: { [key: string]: any } = {};

async function getMongoConnection(key) {
  if (_connectMap[key] === undefined) {
    const mongo_cfg = require("../../conf/mongo");
    const host = mongo_cfg.host;
    const port = mongo_cfg.port;
    const user = mongo_cfg.user;
    const password = mongo_cfg.password;
    const database = mongo_cfg.database;
    const uri = `mongodb://${host}:${port}/${database}`;
    _connectMap[key] = await mongoose.createConnection(uri, {
      poolSize: 10 ,
      auth: { user, password },
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }
  return _connectMap;
}

export {
  getMongoConnection
};

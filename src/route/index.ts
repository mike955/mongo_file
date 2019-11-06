import * as Router from "koa-router";
import * as Busboy from "busboy";
import * as mongodb from "mongodb";
import * as Koa from "koa";
// import * as Grid from "gridfs-stream";
import * as fs from "fs";
import { getMongoConnection } from "../library/utils/mongoose_mongo";
import { globalCfg } from "../conf/global";
import * as mongoose from "mongoose";

const router = new Router();

router
  .all("/test", (ctx, next) => {
    ctx.body = "hello word";
  })
  .post("/upload", async (ctx, next) => {
    if (!ctx.is("multipart/form-data")) {
      ctx.body = "type error";
    }
    const file: any = await extract(ctx.req);
    let mongoKey = globalCfg["mongoKey"];
    const mongoConnect = await getMongoConnection(mongoKey);
    const fileConnect = mongoConnect[mongoKey];
    let res: any = await upload(fileConnect.db, file);
    ctx.body = res;
  })
  .all("/view", async (ctx, next) => {
    let mongoKey = globalCfg["mongoKey"];
    const mongoConnect = await getMongoConnection(mongoKey);
    const fileConnect = mongoConnect[mongoKey];
    let reqBody = ctx.request.body;
    let filename = reqBody.filename || "123456789.png";
    const db: mongodb.Db = fileConnect.db;
    let collection: mongodb.Collection = fileConnect.db.collection(
      "images.files"
    );
    let image_res = await collection.findOne({ filename: filename });
    if (image_res !== null) {
      let res = await download(db, filename);
      ctx.set("content-type", "image/png");
      ctx.body = res;
    } else {
      ctx.body = "find not image";
    }
  })
  .all("/download", async (ctx: Koa.Context, next) => {
    let mongoKey = globalCfg["mongoKey"];
    const mongoConnect = await getMongoConnection(mongoKey);
    const fileConnect = mongoConnect[mongoKey];
    let reqBody = ctx.request.body;
    let filename = reqBody.filename || "123456789.png";
    const db: mongodb.Db = fileConnect.db;
    let collection: mongodb.Collection = fileConnect.db.collection(
      "images.files"
    );
    let image_res = await collection.findOne({ filename: filename });
    if (image_res !== null) {
      let res = await download(db, filename);
      ctx.set({
        "Content-disposition": `attachment; filename="${filename}`,
        "Content-Type": "application/octet-stream"
      });
      ctx.body = res;
    } else {
      ctx.body = "find not image";
    }
  });

async function extract(req) {
  return new Promise((resolve, reject) => {
    let busboy = new Busboy({ headers: req.headers });
    busboy.on("file", (fieldname, fileStream, filename, encoding, mimeType) => {
      let rs = fileStream;
      rs["filename"] = filename;
      rs["encoding"] = encoding;
      rs["mimeType"] = mimeType;
      resolve(rs);
    });
    busboy.on("error", err => reject(err));
    req.pipe(busboy);
  });
}

async function upload(db, fileStream) {
  return new Promise((resolve, reject) => {
    let gridfsBucket = new mongodb.GridFSBucket(db, {
      chunkSizeBytes: 1024,
      bucketName: "images"
    });
    fileStream
      .pipe(gridfsBucket.openUploadStream(fileStream.filename))
      .on("error", error => {
        console.log("Some error occured:" + error);
        reject(error);
      })
      .on("finish", data => {
        console.log("done uploading: ", data);
        resolve(data);
      });
  });
}

async function download(db, filename) {
  return new Promise(async (resolve, reject) => {
    let gridfsBucket = new mongodb.GridFSBucket(db, {
      chunkSizeBytes: 1024,
      bucketName: "images"
    });
    let fileStream: any = [];
    gridfsBucket
      .openDownloadStreamByName(filename)
      .pipe(fs.createWriteStream("./12.png"))
      .on("error", function(error) {
        reject(error);
      })
      .on("finish", function() {
        console.log("done!");
        resolve(fs.createReadStream(filename));
        process.nextTick(() => {
          fs.unlinkSync(filename);
        });
      });

    // fs.createReadStream("./12.png")
    //   .pipe(gridfsBucket.openUploadStream("123456789.png"))
    //   .on("error", function(error) {})
    //   .on("finish", function() {
    //     console.log("done!");
    //     resolve(fs.createReadStream("./12.png"));
    //   });

    // let res = gridfsBucket.openDownloadStreamByName("12.png");
    // console.log("----------- res :", res);
    // let imageStream = cursor._readableState
    // fs.writeFileSync('./123.png', imageStream);
    //   console.log("----------- imageStream :", imageStream);
    //   // .pipe(fs.createWriteStream(buffer))
    // .on("error", error => {
    //   console.log("Some error occured:" + error);
    //   reject(error);
    // })
    // .on("finish", data => {
    //   console.log("done uploading: ", data);
    //   resolve(buffer);
    // });

    // let res = await gridfsBucket.find({ filename: '"1234789.png"'});
    // let res = await db.f
    // resolve(res);
    // return res;
  });
}

export default router;

# mongo_file
a file save using mongoDB

## use
```bash
npm install
npm run dev
```

## mongo
1.docker start a mongo serve
```bash
docker pull mongo:4

docker run --name mongo -d mongo:4
```
2.mongodb create db and user
```mongo
use images

db.createUser({
    user: 'mongo_image',
    pwd: 'mongo_image',
    roles: [ { role: "readWrite", db: "images" } ]
})
```

## uri
 * /upload
   * form-data upload a image
 * /view
   * view a image
 * /download
   * download
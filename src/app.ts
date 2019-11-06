import * as Koa from 'koa';
import router from './route';
import * as bodyParser from 'koa-bodyparser';
import * as http from 'http';


const app = new Koa();

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())

http.createServer(app.callback()).listen(9201, () => {
  console.log('server start 9201')
});
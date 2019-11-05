import * as Koa from 'koa';
import router from './route';
import * as http from 'http';


const app = new Koa();

app
  .use(router.routes())
  .use(router.allowedMethods())

http.createServer(app.callback()).listen(3000);
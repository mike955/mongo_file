import * as Router from 'koa-router';

const router = new Router();

router
  .get('/test', (ctx, next) => {
    ctx.body = 'hello word';
  })

export default router;
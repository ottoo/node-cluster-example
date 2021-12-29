const os = require("os");
const cluster = require("cluster");

const Koa = require("koa");
const router = require("@koa/router")();
const koaBody = require("koa-body");

const availableCPUs = os.cpus().length;

const app = new Koa();
app.use(koaBody());

router.get("/", (ctx) => {
  ctx.body = { ok: true };
});

app.use(router.routes());

const start = () => {
  app.listen(3000, () => {
    console.log("Server started on port 3000");
  });
};

if (process.env.ENABLE_CLUSTERING && availableCPUs > 1) {
  if (cluster.isMaster) {
    for (let i = 0; i < availableCPUs; i++) {
      console.log(`Forking worker ${i}`);
      cluster.fork();
    }

    cluster.on("exit", function (worker) {
      console.log("Worker", worker.id, " has exited.");
    });
  } else {
    start();
  }
} else {
  start();
}

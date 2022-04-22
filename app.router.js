const express = require("express");
const fs = require("fs");
const _path = require("path");

function server() {
  const app = express();

  //设置允许跨域访问该服务.
  app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
  });

  app.use(express.static("dest"));
  app.get("/readme", (req, res) => {
    res.send(fs.readFileSync(_path.resolve(__dirname, "README.md"), 'utf-8'));
  });
  app.get("/datas/:path", (req, res) => {
    const path = req.params.path;
    const filePath = _path.resolve(__dirname, 'datas', path.replace(/;/g, '/'));
    const isExist = fs.existsSync(filePath);
    console.log('filePath: ', filePath);
    if(!isExist) {
      console.log('404')
      return res.status(404).send("path does'not exist: " + filePath);
    }
    res.send(fs.readFileSync(filePath, 'utf-8'));
  });
  const port = 3030;
  app.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log("[server running]", `App listening at ${url}`);
  });
}

server();

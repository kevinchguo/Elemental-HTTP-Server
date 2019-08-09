const http = require("http");
const fs = require("fs");

const PORT = 8080;

const server = http.createServer((req, res) => {
  //   console.log(req);

  console.log(req.method);
  console.log(req.url);
  console.log(req.headers);

  let date = new Date().toUTCString();

  let body = "";
  req.on("data", chunk => {
    body += chunk;
  });
  req.on("end", () => {
    if (req.method === "GET") {
      let contentType = "";
      let directory = "";
      if (req.url === "/") {
        directory = "/index.html";
        contentType = "html";
      } else {
        directory = req.url;
        contentType = req["url"].slice(
          req["url"].indexOf(".") + 1,
          req["url"].length
        );
      }
      fs.readFile(`./public${directory}`, (err, data) => {
        if (err) {
          return console.log(err);
        }

        res.writeHead(200, {
          "Content-Type": `text/${contentType}, charset=utf-8`,
          "Content-Length": data.toString().length,
          Date: date
        });
        res.write(data.toString());
        res.end();
      });
    } else if (req.method === "POST") {
      //console.log(a body)
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server started on PORT: ${PORT}`);
});

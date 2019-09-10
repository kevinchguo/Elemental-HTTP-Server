const http = require("http");
const fs = require("fs");
const querystring = require("querystring");
const PORT = 8080;
let date = new Date().toUTCString();

const server = http.createServer((req, res) => {
  // Body takes in chunks requested by client
  let body = "";
  req.on("data", chunk => {
    body += chunk;
  });
  req.on("end", () => {
    /*** GET Method ***/
    if (req.method === "GET") {
      // Grabs files from public to show to client
      let directory;
      let contentType;
      fs.readdir("./public/", (err, files) => {
        if (err) {
          console.log(err);
          res.writeHead(500, {
            "Content-Type": `application/json, charset=utf-8`,
            error: `resource ${req.url} does not exist`,
            Date: date
          });
          res.end();
        }
        if (files.includes(req.url.slice(1)) === false) {
          // Directory doesn't exist
          if (req.url === "/") {
            // For default page
            directory = "/index.html";
            contentType = "html";
          } else if (req.url.slice(-3) === "css") {
            // Needed to load css properly
            directory = `${req.url}`;
            contentType = "css";
          } else {
            directory = "/404.html";
            contentType = "html";
          }
        } else {
          // Directory exists
          if (req.url.slice(-3) === "css") {
            // Needed to load css properly
            directory = `${req.url}`;
            contentType = "css";
          } else {
            directory = req.url;
            contentType = req.url.slice(
              req.url.indexOf(".") + 1,
              req.url.length
            );
          }
        }
        fs.readFile(`./public${directory}`, (err, data) => {
          // Sends requested data
          if (err) {
            console.log(err);
            res.writeHead(500, {
              "Content-Type": `application/json, charset=utf-8`,
              error: `resource ${req.url} does not exist`,
              Date: date
            });
            res.end();
          }
          res.writeHead(200, {
            "Content-Type": `text/${contentType}, charset=utf-8`,
            "Content-Length": data.toString().length,
            Date: date
          });
          res.write(data.toString());
          res.end();
        });
      });
    }
    /*** POST Method ***/
    if (req.method === "POST") {
      // Decode from the key value pairs in Postman
      let decodeChunk = querystring.parse(body);
      // Used for new element pages
      addOrUpdateElem(
        decodeChunk,
        req,
        res,
        req.method,
        parseNewHTML(decodeChunk, req, res)
      );
    }
    /*** PUT Method ***/
    if (req.method === "PUT") {
      // Decode from the key value pairs in Postman
      let decodeChunk = querystring.parse(body);
      fs.readdir("./public/", (err, files) => {
        if (err) {
          console.log(err);
          res.writeHead(500, {
            "Content-Type": `application/json, charset=utf-8`,
            error: `resource ${req.url} does not exist`,
            Date: date
          });
          res.end();
        }
        if (files.includes(req.url.slice(1)) === true) {
          addOrUpdateElem(
            decodeChunk,
            req,
            res,
            req.method,
            parseNewHTML(decodeChunk, req, res)
          );
        } else {
          res.writeHead(500, {
            "Content-Type": `application/json, charset=utf-8`,
            error: `resource ${req.url} does not exist`,
            Date: date
          });
          res.end();
        }
      });
    }
    /*** DELETE Method ***/
    if (req.method === "DELETE") {
      // Decode from the key value pairs in Postman
      let decodeChunk = querystring.parse(body);
      fs.readdir("./public/", (err, files) => {
        if (err) {
          console.log(err);
          res.writeHead(500, {
            "Content-Type": `application/json, charset=utf-8`,
            error: `resource ${req.url} does not exist`,
            Date: date
          });
          res.end();
        }
        if (files.includes(req.url.slice(1)) === true) {
          fs.unlink(`./public${req.url}`, err => {
            if (err) {
              console.log(err);
              res.writeHead(500, {
                "Content-Type": `application/json, charset=utf-8`,
                error: `Request not sent`,
                Date: date
              });
              res.end();
            }
            parseNewHTML(decodeChunk, req, res);
          });
        }
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server started on PORT: ${PORT}`);
});

/*************** FUNCTIONS **************/

// Add and/or Update element.html
function addOrUpdateElem(chunk, req, res, method, func) {
  // Used for new element pages
  let htmlTemplate = `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>The Elements - ${chunk["elementName"]}</title>
            <link rel="stylesheet" href="/css/styles.css" />
          </head>
          <body>
            <h1>${chunk["elementName"]}</h1>
            <h2>${chunk["elementSymbol"]}</h2>
            <h3>Atomic number ${chunk["elementAtomicNumber"]}</h3>
            <p>
              ${chunk["elementDescription"]}
            </p>
            <p><a href="/">back</a></p>
          </body>
        </html>`;
  // Create new element page
  fs.writeFile(`./public/${chunk["elementName"]}.html`, htmlTemplate, err => {
    if (err) {
      return console.log("Cannot write file " + err);
    }
  });
  if (method === "POST" || method === "PUT") {
    func;
  } else {
    res.writeHead(200, {
      "Content-Type": `text/html, charset=utf-8`,
      "Content-Length": htmlTemplate.length,
      Date: date
    });
    res.end();
  }
}

// Creates and/or updates index.html
function parseNewHTML(chunk, req, res) {
  let existingFiles = [];
  let contentLength = 0;
  fs.readdir("./public/", (err, files) => {
    if (err) {
      console.log("Directory is not there " + err);
      res.writeHead(500, {
        "Content-Type": `application/json, charset=utf-8`,
        error: `resource ${req.url} does not exist`,
        Date: date
      });
      res.end();
    }
    for (let x = 0; x < files.length; x++) {
      if (![".keep", "404.html", "css", "index.html"].includes(files[x])) {
        existingFiles.push(files[x]);
      }
    }
    // Top part of index.html
    let indexTop = `<!DOCTYPE html>
    <html lang="en">
    
    <head>
      <meta charset="UTF-8" />
      <title>The Elements</title>
      <link rel="stylesheet" href="/css/styles.css" />
    </head>
    
    <body>
      <h1>The Elements</h1>
      <h2>These are all the known elements.</h2>
      <h3>These are ${existingFiles.length}</h3>
      <ol>`;
    // Middle part of index.html
    for (let y = 0; y < existingFiles.length; y++) {
      let indexMid = `
        <li>
          <a href="/${existingFiles[y]}">${existingFiles[y].split(".")[0]}</a>
        </li>`;
      indexTop += indexMid;
    }
    // Bottom part of index.html
    let indexEnd = `
      </ol>
    </body>
  </html>`;
    contentLength = indexTop.length + indexEnd.length;
    // index.html is re-written with new ref to new elements
    fs.writeFile("./public/index.html", `${indexTop}${indexEnd}`, err => {
      if (err) {
        console.log("Cannot write file " + err);
        res.writeHead(500, {
          "Content-Type": `application/json, charset=utf-8`,
          error: `resource ${req.url} does not exist`,
          Date: date
        });
        res.end();
      }
      res.writeHead(200, {
        "Content-Type": `text/html, charset=utf-8`,
        "Content-Length": contentLength,
        Date: date
      });
      res.end();
    });
  });
}

const http = require("node:http"),
  fs = require("node:fs"),
  mime = require("mime"),
  dir = "public/",
  port = 3000;

const appdata = [

];

const server = http.createServer(function(request, response) {
    if (request.method === "GET") {
        handleGet(request, response);
    } else if (request.method === "POST") {
        handlePost(request, response);
    }
});

const handleGet = function(request, response) {
    const filename = dir + request.url.slice(1);

    if (request.url === "/") {
        sendFile(response, "public/index.html");
    } else if (request.url === "/shapes") {
        response.writeHead(200, { "Content-Type": "application/json" });
        console.log(JSON.stringify(appdata));
        response.end(JSON.stringify(appdata));
    } else {
        sendFile(response, filename);
    }
};

const handlePost = function(request, response) {
    let dataString = "";

    // Collect the data as it comes in chunks
    request.on("data", function(data) {
        dataString += data;
    });

    // When all the data has been received, parse it and log it
    request.on("end", function() {
        try {
            const parsedData = JSON.parse(dataString);
            console.log("Received data:", parsedData);

            parsedData.selfTitled = parsedData.userName.toLowerCase() === parsedData.shapeName.toLowerCase();

            console.log("Modified data:", parsedData);

            appdata.push(parsedData);
            // You can process the data here (e.g., store it in a database, or perform other operations)
            // For now, we just send back a confirmation message.

            response.writeHead(200, { "Content-Type": "text/plain" });
            response.end("received successfully!");
        } catch (error) {
            console.error("Error parsing JSON:", error);
            response.writeHead(400, { "Content-Type": "text/plain" });
            response.end("Error parsing data");
        }
    });
};

const sendFile = function(response, filename) {
    const type = mime.getType(filename);

    fs.readFile(filename, function(err, content) {
        if (err === null) {
            response.writeHeader(200, { "Content-Type": type });
            response.end(content);
        } else {
            response.writeHeader(404);
            response.end("404 Error: File Not Found");
        }
    });
};

// Listen on the configured port (or default to 3000)
server.listen(process.env.PORT || port, () => {
    console.log(`Server running on port ${port}`);
});

const express = require("express"),
    app = express(),
    expressWs = require("express-ws")
    PORT = 5000,
    FOLDER = __dirname.split('/').slice(0, -1).join('/'),
    SERVER_FOLDER = FOLDER + '/server',
    CLIENT_FOLDER = FOLDER + '/client',
    fs = require('fs');

// setting rotes to serve /client files!
app.get("/", (req, res) => {
    res.sendFile(CLIENT_FOLDER + '/index.html');
});

app.use(express.static(CLIENT_FOLDER + '/backend', {
    maxAge: '4 months',  // Cache for 4 months
    etag: false
}));

// setting express WebSocket!
expressWs(app)

// binding the expressJS web-server to port 
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
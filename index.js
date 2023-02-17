const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const {spawn} = require('child_process');
const SERVER_DIR = './Server';
const SERVER_JAR = 'server.jar';

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    console.log('a user connected');

    const minecraftServer = spawn('java', ['-Xmx1024M', '-Xms1024M', '-jar', SERVER_JAR, 'nogui'], {
        cwd: SERVER_DIR,
        stdio: ['pipe', 'pipe', 'pipe']
    });

    minecraftServer.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output);
        socket.emit('output', output);
    });

    minecraftServer.stderr.on('data', (data) => {
        console.error(`Minecraft server error: ${data}`);
    });

    minecraftServer.on('close', (code) => {
        console.log(`Minecraft server process exited with code ${code}`);
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
        minecraftServer.kill();
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

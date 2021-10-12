require('dotenv').config();
const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;
const INTERVAL = process.env.INTERVAL;
const TIME = process.env.TIME;


let connections = [];

app.get('/date', (req, res, next) => {
    res.setHeader("Content-type", "text/html; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    connections.push(res);
})

setTimeout(function run() {
    connections.map((res, i) => {
        let date = new Date();
        res.write(`Hello ${i} Time: ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}\n`)
    })
    setTimeout(run, INTERVAL)
}, INTERVAL);

setInterval(() => {
    connections.map(res => {
        let date = new Date();
        res.write(`time is up!, Date: ${date.getUTCDay()}.${date.getUTCMonth()}.${date.getUTCFullYear()} Time: ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()} \n`);
        res.end();
    })
    connections = [];
}, TIME);

app.listen(PORT, () => {
    console.log(`server listens port ${PORT}`)
})
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {App} from './dist/app-server.mjs';

const html = renderToString(React.createElement(App, {text: 'Hello'}));
const page = `<!doctype html><html><head><meta charset="utf-8"><title>loading</title></head><body><div id="root">${html}</div><script src="/client.js"></script></body></html>`;

createServer((req, res) => {
  if (req.url === '/client.js') {
    res.setHeader('content-type', 'text/javascript');
    res.end(readFileSync('./dist/client.js'));
    return;
  }
  res.setHeader('content-type', 'text/html');
  res.end(page);
}).listen(3200, () => console.log('http://localhost:3200'));

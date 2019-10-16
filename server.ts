// These two global imports are required for SSR
import 'zone.js/dist/zone-node';
import 'reflect-metadata';

// This is required to render the html on the server
import { renderModuleFactory } from '@angular/platform-server';

import { readFileSync } from 'fs';
import * as express from 'express';
import { enableProdMode } from '@angular/core';

// Initialize the factory with the server app bundle
const { AppServerModuleNgFactory } = require('./dist-server/main.js');

// Optimizes for faster rendering
enableProdMode();

const app = express();

// Get index.html file from client bundle
const indexHtml = readFileSync(__dirname + '/dist/explearning/index.html', 'utf-8').toString();

// Fetch js and css bundles
app.get('*.*', express.static(__dirname + '/dist/explearning', {
  maxAge: '1y'
}));

app.route('*').get((req, res) => {

  // Render full HTML using Angular factory
  renderModuleFactory(AppServerModuleNgFactory, {
    document: indexHtml,
    url: req.url
  })
    .then(html => res.status(200).send(html)) // Send rendered response to client
    .catch(err => {
      console.log(err);
      res.sendStatus(500);
    });

});

app.listen(9000, () => {
  console.log(`Angular Universal Node Express server listening on http://localhost:9000`);
});

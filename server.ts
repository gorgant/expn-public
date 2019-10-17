
import { ngExpressEngine } from '@nguniversal/express-engine';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import {renderModuleFactory} from '@angular/platform-server';
import * as express from 'express';
import { readFileSync } from 'fs';
import { enableProdMode } from '@angular/core';

const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist-server/main');

enableProdMode();

const app = express();

// const indexHtml = readFileSync(__dirname + '/dist/explearning/index.html', 'utf-8').toString();

// // OLD MANUAL SERVER
// app.get('*.*', express.static(__dirname + '/dist/explearning', {
//     maxAge: '1y'
// }));

// app.route('*').get((req, res) => {

//     console.log('Received route request');

//     renderModuleFactory(AppServerModuleNgFactory, {
//         document: indexHtml,
//         url: req.url
//     })
//         .then(html => {
//             console.log('Sending route response');
//             res.status(200).send(html);
//         })
//         .catch(err => {
//             console.log(err);
//             res.sendStatus(500);
//         });

// });

const distFolder = __dirname + '/dist/explearning';

// Define a custom express engine using the Universal Adapter
// This engine will be reading the index HTML from the file system directly, so no need to pass it in manually
app.engine('html', ngExpressEngine({
    bootstrap: AppServerModuleNgFactory,
    // Configure Angular specific injectable services only available on server
    providers: [
      provideModuleMap(LAZY_MODULE_MAP), // Enable lazy loading functionality
    ]
}));

app.set('view engine', 'html'); // Set the view engine to our custom adapter above
app.set('views', distFolder); // Tell express where to find the view files, only one with an SPA

// First statically serve any bundle files from the dist folder directly
app.get('*.*', express.static(distFolder, {
    maxAge: '1y' // Cache for one year, will be replaced if new bundle
}));

app.get('*', (req, res) => {
    // Render the index view (name of file w/ out extension)
    // The engine will use the reqest data to determine the correct route to render
    // It will then serve that view to the client
    console.log('Receiving route request');
    res.render('index', { req });
});

app.listen(9000, () => {
    console.log(`Angular Universal Node Express server listening on http://localhost:9000`);
});






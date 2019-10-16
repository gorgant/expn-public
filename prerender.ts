// These two global imports are required for SSR
import 'zone.js/dist/zone-node';
import 'reflect-metadata';

// This is required to render the html on the server
import { renderModuleFactory } from '@angular/platform-server';
import { writeFileSync } from 'fs';

// Initialize the factory with the server app bundle
const { AppServerModuleNgFactory } = require('./dist-server/main.js');

// Render the HTML in NodeJS environment
renderModuleFactory(AppServerModuleNgFactory, {
  document: '<app-root></app-root>', // Select the code to be rendered
  url: '/' // Render the root route (which will be handled by the router outlet)
})
  .then(html => {

    console.log('Pre-rendering successful, saving prerender.html');
    writeFileSync('./prerender.html', html);

  })
  .catch(error => {
    console.error('Error occured:', error);
  });

// import * as express from 'express';
// const app = express();
// import * as urlModule from 'url';
// const URL = urlModule.URL;

// I DON"T THINK I NEED THIS SERVER, WILL USE PUBSUB INSTEAD

// app.get('/cron/update_cache', async (req, res) => {
//   if (!req.get('X-Appengine-Cron')) {
//     return res.status(403).send('Sorry, cron handler can only be run as admin.');
//   }

//   const browser = await puppeteer.launch();
//   const homepage = new URL(`${req.protocol}://${req.get('host')}`);

//   // Re-render main page and a few pages back.
//   prerender.clearCache();
//   await prerender.ssr(homepage.href, await browser.wsEndpoint());
//   await prerender.ssr(`${homepage}?year=2018`);
//   await prerender.ssr(`${homepage}?year=2017`);
//   await prerender.ssr(`${homepage}?year=2016`);
//   await browser.close();

//   return res.status(200).send('Render cache updated!');
// });

// // Listen to the App Engine-specified port, or 8080 otherwise
// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}...`);
// });
import { Order } from '../../../shared-models/orders/order.model';
// import * as https from 'https';
import { now } from 'moment';
import * as Stripe from 'stripe';
import { getSingleCharge } from '../stripe/charges';
// import * as request from 'request';

import { PubSub } from '@google-cloud/pubsub';
const pubSub = new PubSub();

export const publishOrderToAdminTopic = async (chargeData: Stripe.charges.ICharge) => {
  
  // Get charge with expanded customer data
  const charge = await getSingleCharge(chargeData.id);

  const order: Partial<Order> = {
    processedDate: now(),
    stripeChargeId: charge.id,
    stripeCustomerId: (charge.customer as Stripe.customers.ICustomer).id,
    name: (charge.customer as any).name as string,
    email: (charge.customer as Stripe.customers.ICustomer).email as string,
    anonymousUID: (charge.customer as Stripe.customers.ICustomer).metadata.firebaseUID,
    productId: charge.metadata.productId,
    amountPaid: charge.amount,
    status: 'inactive',
  }

  const topic = pubSub.topic('projects/explearning-admin/topics/save-order');

  const topicPublishRes = await topic.publishJSON(order).catch(err => console.log('Publish to topic failed', err));
  console.log('Res from topic publish', topicPublishRes);

  return topicPublishRes;
}




// export const transmitOrder = async (chargeData: Stripe.charges.ICharge) => {

//   // Get charge with expanded customer data
//   const charge = await getSingleCharge(chargeData.id);

//   const order: Partial<Order> = {
//     processedDate: now(),
//     stripeChargeId: charge.id,
//     stripeCustomerId: (charge.customer as Stripe.customers.ICustomer).id,
//     name: (charge.customer as any).name as string,
//     email: (charge.customer as Stripe.customers.ICustomer).email as string,
//     anonymousUID: (charge.customer as Stripe.customers.ICustomer).metadata.firebaseUID,
//     productId: charge.metadata.productId,
//     amountPaid: charge.amount,
//     status: 'inactive',
//   }


//   const postData = JSON.stringify(order);

//   const headers = {
//     'Content-Type': 'application/json',
//     'Content-Length': Buffer.byteLength(postData),
//     'Accept': 'application/json',
//     'Access-Control-Allow-Headers': 'Content-Type',
//   }
  
//   // const options = {
//   //   hostname: 'us-central1-explearning-admin.cloudfunctions.net',
//   //   port: 443,
//   //   path: '/storeOrder',
//   //   method: 'POST',
//   //   headers: {
//   //     'Content-Type': 'application/json',
//   //     'Content-Length': Buffer.byteLength(postData)
//   //  }
//   // };

//   const requestPromise = new Promise<{}>(async (resolve, reject) => {

//     const url2 = 'https://us-central1-explearning-admin.cloudfunctions.net/storeOrder'

//     request.post(
//       {
//         url: url2,
//         body: postData,
//         headers
//       }, (err, res, body) => {
//         if (!err && res.statusCode == 200) {
//           //here put what you want to do with the request
//           // res.setEncoding('utf8'); // Parse response with this code type
//           // res.on('data', (d) => {
//           //   // const dataBuffer = d as Buffer;
//           //   // const stringData = dataBuffer.toString('utf8');
//           //   const jsonData = JSON.parse(d as string);
//           //   console.log('Received this response', jsonData);
//           //   resolve(jsonData);
//           // });
//           console.log('received this response', body);
//           resolve(body);
//         }
//         if (err) {
//           console.log(`Problem with request: ${err}`);
//           reject(err);
//         }
//       }
//     );

//     // const req = https.request(options, (res) => {
//     //   console.log(`Transmit Order Response Status: ${res.statusCode}`);
//     //   let jsonData = {};
//     //   res.setEncoding('utf8'); // Parse response with this code type
//     //   res.on('data', (d) => {
//     //     console.log('Raw response', d);
//     //     const dataBuffer = d as Buffer;
//     //     const stringData = dataBuffer.toString('utf8');
//     //     jsonData = JSON.parse(stringData);
//     //     console.log('Response received', jsonData);
//     //     resolve(jsonData);
//     //   });

//     //   // res.on('end', () => {
//     //   //   if (res.statusCode === 200) {
//     //   //     console.log(`Transmission successful. Order Response Content: ${res.statusCode}`);
//     //   //     resolve(jsonData)
//     //   //   }
//     //   // });
//     // });

//     // req.on('error', (e: any) => {
//     //   console.log(`Problem with request: ${e}`);
//     //   reject(e);
//     // });
//     // req.write(postData); // Write the data to the request
//     // req.end();



//   });

//   return requestPromise;

// }
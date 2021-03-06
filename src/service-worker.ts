/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

import { resetCart } from "./redux/cartSlice";
import { useAppDispatch } from "./redux/hooks";
import { deleteSyncCartItem, getSyncCartItems, getCartItems, deleteCartItem } from './utility';

let communicationPort: any;
declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// Precache all of the assets generated by your build process.
// Their URLs are injected into the manifest variable below.
// This variable must be present somewhere in your service worker file,
// even if you decide not to use precaching. See https://cra.link/PWA
precacheAndRoute(self.__WB_MANIFEST);

// Set up App Shell-style routing, so that all navigation requests
// are fulfilled with your index.html shell. Learn more at
// https://developers.google.com/web/fundamentals/architecture/app-shell
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  // Return false to exempt requests from being fulfilled by index.html.
  ({ request, url }: { request: Request; url: URL }) => {
    // If this isn't a navigation, skip.
    if (request.mode !== 'navigate') {
      return false;
    }

    // If this is a URL that starts with /_, skip.
    if (url.pathname.startsWith('/_')) {
      return false;
    }

    // If this looks like a URL for a resource, because it contains
    // a file extension, skip.
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }

    // Return true to signal that we want to use the handler.
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// Api Cache
registerRoute(
  // Add in any other file extensions or routing criteria as needed.
  // ({ url }) => url.origin === self.location.origin && url.pathname.endsWith('.png'),
  ({ url }) => {
    return (url.pathname.split("/").indexOf('items') !== -1);
  },
  // Customize this strategy as needed, e.g., by changing to CacheFirst.
  new StaleWhileRevalidate({
    cacheName: 'StaticApiCache',
    plugins: [
      // Ensure that once this runtime cache reaches a maximum size the
      // least-recently used images are removed.
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);

// An example runtime caching route for requests that aren't handled by the
// precache, in this case same-origin .png requests like those from in public/
registerRoute(
  // Add in any other file extensions or routing criteria as needed.
  // ({ url }) => url.origin === self.location.origin && url.pathname.endsWith('.png'),
  ({ url }) => url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg'),
  // Customize this strategy as needed, e.g., by changing to CacheFirst.
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      // Ensure that once this runtime cache reaches a maximum size the
      // least-recently used images are removed.
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);

// addEventListener('fetch', (event: any) => {
  // console.log('communicationPort ==========> ', communicationPort);
  // if (communicationPort !== undefined) {
  //   communicationPort.postMessage({type: 'MSG_ID'});
  // }
  // event.waitUntil(async function() {
  //   // Exit early if we don't have access to the client.
  //   // Eg, if it's cross-origin.
  //   console.log('event.clientId ============> ', event.clientId, self.clients);
  //   if (!event.clientId) return;

  //   // Get the client.
  //   const client = await self.clients.get(event.clientId);
  //   // Exit early if we don't get the client.
  //   // Eg, if it closed.
  //   if (!client) return;

  //   // Send a message to the client.
  //   client.postMessage({
  //     msg: "Hey I just got a fetch from you!",
  //     url: event.request.url
  //   });

  // }());
// });

// This allows the web app to trigger skipWaiting via
// get message in service worker
addEventListener('message', (event) => {
  // console.log('event =============$$$$$> ', event, event.data, event?.ports);
  // if (event.data && event.data.type === 'PORT_INITIALIZATION') {
  //   communicationPort = event.ports[0];
  // }

  if (event.data && event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Any other custom service worker logic can go here.
self.addEventListener('fetch', event => {
  event.respondWith(async function() {
    const networkResponse = await fetch(event.request);
    return networkResponse;
  }());
});

self.addEventListener('sync', (event: any) => {
  console.log('in sync', event.tag);
  if (event.tag == 'sync-cart') {
    event.waitUntil(
      getSyncCartItems().then((syncData: any) => {
        console.log('syncData =========> ', syncData);

        if (syncData.length) {
          let itemsArr: any = [];
          syncData[0].info.items.map((ele: any) => {
            itemsArr.push({
              itemId: ele.itemId,
              quantity: ele.qty
            });
          });
          const data = {
            items: itemsArr,
            totalAmount: syncData[0].info.totalAmount,
            status: "Accepted",
            address: syncData[0].info.address
          }

          fetch(`${process.env.REACT_APP_API_ENDPOINT}v1/user/${syncData[0].info.userId}/order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(data),
          }).
          then((response) => response.json())
          .then(() => {
            // delete sync cart
            deleteSyncCartItem(syncData[0].cartId);

            // delete cart
            // window.localStorage.setItem("sw-messages", "true");
            // window.dispatchEvent( new Event('storage') )
            try {
              const channel = new BroadcastChannel('sw-messages');
              channel.postMessage({
                msg: 'orderplaced'
              });
            } catch (error) {
              
            }
            
            getCartItems().then((data) => {
              if(data.length) {
                data.forEach((item) => {
                  deleteCartItem(item.itemId);
                });
              }
            });
          })
          .catch((err) => {
            // issue with place order show error toast
            console.log('error 2', err);
          });
        }
      }).catch(() => {
        console.log('error 1');
      })
    );
  }
});

self.addEventListener('notificationclick', (event: any) => {
  let notification = event.notification;
  let action = event.action;

  if (action === 'confirm') {
    console.info('User enabled notifications feature.', event);
    notification.close();
  } else {
    event.waitUntil(
      self.clients.matchAll({includeUncontrolled: true})
        .then((clientArray: any) => {
          let orderClient;

          for (const client of clientArray) {
            const url = new URL(client.url);
            if (url.pathname.indexOf(notification.data.url) !== -1) {
              client.focus();
              orderClient = client;
              break;
            }
          }

          if(!orderClient) {
            self.clients.openWindow(notification.data.url);
          }
          
          // const client = clis.find((c: any) => {
          //   return c.visibilityState = 'visible';
          // });

          // if (client) {
          //   client.navigate(notification.data.url);
          //   client.focus();
          // } else {
            
          // }
          notification.close();
        })
    )
  }
});

self.addEventListener('notificationclose', (event: any) => {
  console.log('inside notification close');
});

self.addEventListener('push', (event: any) => {
  console.log('inside notification close');

  var data = {title: 'Order Status', content: 'Order status is updated!', openUrl: '/'};
  if (event.data) {
    data = JSON.parse(event.data.text());
  }

  var options = {
    body: data.content,
    icon: '/public/logo96x96.png',
    badge: '/public/logo96x96.png',
    data: {
      url: data.openUrl
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

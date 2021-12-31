// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// To learn more about the benefits of this model and instructions on how to
// opt-in, read https://cra.link/PWA

import { addNotificationInfo, getMobileInfo } from './utility';

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};


export function register(config?: Config) {
  if ('serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        // used to sync cart
        // navigator.serviceWorker.ready.then((registration: any) => {
        //   console.log(
        //     'This web app is being served cache-first by a service ' +
        //       'worker. To learn more, visit https://cra.link/PWA'
        //   );
        //   registration.sync.register('sync-cart');
        // });

        // used for push notification
        // var reg: any;
        // let newSubFlag: boolean = false;
        // navigator.serviceWorker.ready.then((registration: any) => {
        //   reg = registration;
        //   return registration.pushManager.getSubscription()
        // })
        // .then((subscripton) => {
        //   if (subscripton === null) {
        //     var publicKey = 'BK9mXb-qPoH-A4mL9quCuZv7Z7Pd2-o6RsFK_iVRBtTk6uBE13b5Pc5pKLpiGLzEDyyifMsZU4Bxa6jsNJuDBR4';
        //     // var vapidPublicKey = urlBase64ToUint8Array(publicKey);
        //     newSubFlag = true;
        //     // create new subscripton
        //     return reg.pushManager.subscribe({
        //       userVisibleOnly: true,
        //       applicationServerKey: vapidPublicKey,
        //     });
        //   } else {
        //     // we have a subscripton
        //     return subscripton;
        //   }
        // }).then(function(newSub) {
        //   if (newSubFlag) {
        //     getMobileInfo().then((data) => {
        //         // add notification data
        //         if (data !== undefined) {
        //           fetch(`http://localhost:8080/v1/${data._id}/notification`, {
        //             method: 'POST',
        //             headers: {
        //               'Content-Type': 'application/json',
        //               'Accept': 'application/json'
        //             },
        //             body: JSON.stringify(data.info)
        //           })
        //           .then((response) => response.json())
        //           .then((...data: any) => {
        //             if (data[0].Status === 'failure') {
        //               // show error and add notification data into indexDB
        //               addNotificationInfo({ Index: '1', info: JSON.stringify(newSub) });
        //             } else {
        //               // show success toast
        //             }
        //           })
        //           .catch();
        //         } else {
        //           addNotificationInfo({ Index: '1', info: JSON.stringify(newSub) });
        //         }
        //     })
        //   }
        // });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                'New content is available and will be used when all ' +
                  'tabs for this page are closed. See https://cra.link/PWA.'
              );

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log('Content is cached for offline use.');

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

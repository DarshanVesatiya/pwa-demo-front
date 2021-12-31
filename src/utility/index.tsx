import { openDB } from 'idb';

const dbPromise = openDB('DummyAPK', 2, {
  upgrade(db) {
    db.createObjectStore('cart', {
      // The 'id' property of the object will be the key.
      keyPath: 'itemId',
    });
    db.createObjectStore('sync-cart', {
      // The 'id' property of the object will be the key.
      keyPath: 'cartId',
    });
    db.createObjectStore('userSession', {
      // The 'id' property of the object will be the key.
      keyPath: 'userIndex',
    });
    db.createObjectStore('notificationInfo', {
      // The 'id' property of the object will be the key.
      keyPath: 'Index',
    });
  },
});

export async function getNotificationInfo() {
  return (await dbPromise).get('notificationInfo', '1');
};

export async function addNotificationInfo(val: any) {
  return (await dbPromise).put('notificationInfo', val);
};

export async function deleteNotificationInfo() {
  return (await dbPromise).delete('notificationInfo', '1');
};

export async function getMobileInfo() {
  return (await dbPromise).get('userSession', '1');
};

export async function addMobileInfo(val: any) {
  return (await dbPromise).put('userSession', val);
};

export async function deleteMobileInfo(key: string) {
  return (await dbPromise).delete('userSession', key);
};

export async function getCartItems() {
  return (await dbPromise).getAll('cart');
};

export async function getCartItem(key: string) {
  return (await dbPromise).get('cart', key);
};

export async function addUpdateCartItems(key: string, val: any) {
  return (await dbPromise).put('cart', val);
};

export async function deleteCartItem(key: string) {
  return (await dbPromise).delete('cart', key);
};

export async function getSyncCartItems() {
  return (await dbPromise).getAll('sync-cart');
};

export async function getSyncCartItem(key: string) {
  return (await dbPromise).get('sync-cart', key);
};

export async function addSyncUpdateCartItems(key: string, val: any) {
  return (await dbPromise).put('sync-cart', val);
};

export async function deleteSyncCartItem(key: string) {
  return (await dbPromise).delete('sync-cart', key);
};

export function urlBase64ToUint8Array(base64String: string) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
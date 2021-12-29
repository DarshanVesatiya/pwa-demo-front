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
  },
});

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

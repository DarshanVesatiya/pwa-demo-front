import { openDB } from 'idb';

const dbPromise = openDB('DummyAPK', 1, {
  upgrade(db) {
    db.createObjectStore('cart', {
      // The 'id' property of the object will be the key.
      keyPath: 'itemId',
    });
  },
});

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

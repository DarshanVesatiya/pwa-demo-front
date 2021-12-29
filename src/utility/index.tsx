import { openDB } from 'idb';

const dbPromise = openDB('DummyAPK', 1, {
  upgrade(db) {
    db.createObjectStore('items', {
      // The 'id' property of the object will be the key.
      keyPath: '_id',
    });
  },
});

// export async function get(key) {
//   return (await dbPromise).get('keyval', key);
// };

export async function addUpdateItems(key: any, val: any) {
  return (await dbPromise).put('items', val, key);
};

// export async function del(key) {
//   return (await dbPromise).delete('keyval', key);
// };
// export async function clear() {
//   return (await dbPromise).clear('keyval');
// };
// export async function keys() {
//   return (await dbPromise).getAllKeys('keyval');
// };

// function writeData(st, data) {
//   return dbPromise
//     .then(function(db) {
//       var tx = db.transaction(st, 'readwrite');
//       var store = tx.objectStore(st);
//       store.put(data);
//       return tx.complete;
//     });
// }

// function readAllData(st) {
//   return dbPromise
//     .then(function(db) {
//       var tx = db.transaction(st, 'readonly');
//       var store = tx.objectStore(st);
//       return store.getAll();
//     });
// }

// function clearAllData(st) {
//   return dbPromise
//     .then(function(db) {
//       var tx = db.transaction(st, 'readwrite');
//       var store = tx.objectStore(st);
//       store.clear();
//       return tx.complete;
//     });
// }

// function deleteItemFromData(st, id) {
//   dbPromise
//     .then(function(db) {
//       var tx = db.transaction(st, 'readwrite');
//       var store = tx.objectStore(st);
//       store.delete(id);
//       return tx.complete;
//     })
//     .then(function() {
//       console.log('Item deleted!');
//     });
// }
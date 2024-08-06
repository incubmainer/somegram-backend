import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

type Key = string | symbol;
type Store = Map<Key, any>;

const asyncLocalStorage = new AsyncLocalStorage<Store>();

@Injectable()
export class AlsService {
  private asyncLocalStorage = asyncLocalStorage;

  start(callback: () => void) {
    this.asyncLocalStorage.run(new Map(), () => {
      callback();
    });
  }

  setToStore<V>(key: Key, value: V): void {
    const store = this.asyncLocalStorage.getStore();
    if (!store) throw new Error('Store is not initialized');
    store.set(key, value);
  }

  getFromStore<V>(key: Key): V {
    const store = this.asyncLocalStorage.getStore();
    if (!store) throw new Error('Store is not initialized');
    return store.get(key);
  }
}

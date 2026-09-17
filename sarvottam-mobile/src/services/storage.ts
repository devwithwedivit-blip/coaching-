import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryStore: Record<string, string> = {};

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null) return val;
    } catch {}
    return memoryStore[key] || null;
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {}
    memoryStore[key] = value;
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {}
    delete memoryStore[key];
  },

  async getJson<T>(key: string, fallback: T): Promise<T> {
    try {
      const str = await this.getItem(key);
      if (str) return JSON.parse(str);
    } catch {}
    return fallback;
  },

  async setJson<T>(key: string, value: T): Promise<void> {
    await this.setItem(key, JSON.stringify(value));
  },
};

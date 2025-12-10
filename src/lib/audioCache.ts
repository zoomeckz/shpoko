// IndexedDB-based audio cache for TTS audio files
const DB_NAME = 'shpoko-audio-cache';
const DB_VERSION = 1;
const STORE_NAME = 'audio-files';

let dbPromise: Promise<IDBDatabase> | null = null;

const openDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;
  
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'text' });
      }
    };
  });
  
  return dbPromise;
};

export const getCachedAudio = async (text: string): Promise<string | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(text);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result?.audioContent || null);
      };
    });
  } catch (error) {
    console.error('Error getting cached audio:', error);
    return null;
  }
};

export const setCachedAudio = async (text: string, audioContent: string): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ text, audioContent, timestamp: Date.now() });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Error caching audio:', error);
  }
};

export const preloadAudio = async (texts: string[], onProgress?: (loaded: number, total: number) => void): Promise<void> => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  let loaded = 0;
  const total = texts.length;
  
  for (const text of texts) {
    const cached = await getCachedAudio(text);
    if (!cached) {
      try {
        const { data, error } = await supabase.functions.invoke("text-to-speech", {
          body: { text },
        });
        
        if (!error && data?.audioContent) {
          await setCachedAudio(text, data.audioContent);
        }
      } catch (e) {
        console.error(`Failed to preload audio for: ${text}`, e);
      }
    }
    loaded++;
    onProgress?.(loaded, total);
  }
};

import { Database } from "@/context/constants";
import React from "react";
import { useCallback, useEffect, useState } from "react";

// Interface defining the return type for useIndexedDB hook
interface UseIndexedDBResult {
  getValue: (tableName: string, key: string) => Promise<any | null>;
  getAllValue: (tableName: string) => Promise<any[]>;
  putValue: (tableName: string, value: object) => Promise<IDBValidKey | null>;
  putBulkValue: (tableName: string, values: object[]) => Promise<any[]>;
  updateValue: (params: {
    tableName: string;
    key: string;
    newItem: any;
  }) => void;
  deleteValue: (tableName: string, key: string) => string | null;
  deleteAll: (tableName: string) => void;
  isDBConnecting: boolean;
}
const IndexdbContext = React.createContext({ isDBConnecting: true } as UseIndexedDBResult);

export const useIndexedDB = () => React.useContext(IndexdbContext);

export const IndexDbContextProvider = ({ children }: { children: any }) => {
  const value = useIndexedDBPrivate(Database.name, Database.tables);

  return <IndexdbContext.Provider value={value}>{children}</IndexdbContext.Provider>
};

const useIndexedDBPrivate = (
  databaseName: string,
  tableNames: string[]
): UseIndexedDBResult => {
  const [db, setDB] = useState<IDBDatabase | null>(null);
  const [isDBConnecting, setIsDBConnecting] = useState<boolean>(true);

  useEffect(() => {
    const initDB = () => {
      const request = indexedDB.open(databaseName, Database.version);

      // Handle database upgrade
      request.onupgradeneeded = () => {
        const database = request.result;
        tableNames.forEach((tableName) => {
          if (!database.objectStoreNames.contains(tableName)) {
            const objectStore = database.createObjectStore(tableName, {
              autoIncrement: true,
              keyPath: "id",
            });
            objectStore.createIndex("xucreKey", "xucreKey");
          }
        });
      };

      // Handle successful database connection
      request.onsuccess = () => {
        setDB(request.result);
        setIsDBConnecting(false);
      };

      // Handle errors in database connection
      request.onerror = () => {
        console.error("Error initializing IndexedDB:", request.error);
        setIsDBConnecting(false);
      };
    };

    if (!db) {
      initDB();
    }
  }, [databaseName, tableNames, db]);

  // Helper function to get a transaction for a specific table
  const getTransaction = (tableName: string, mode: IDBTransactionMode) => {
    if (!db) throw new Error("Database is not initialized");
    return db.transaction(tableName, mode).objectStore(tableName);
  };

  // Function to get a specific value from the table by ID
  const getValue = useCallback(
    (tableName: string, key: string): Promise<any | null> => {
      return new Promise((resolve, reject) => {
        try {
          const store = getTransaction(tableName, 'readonly');
          const request = store.get(key);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => {
            console.error("Error getting value from IndexedDB:", request.error);
            resolve(null);
          }
        } catch (error) {
          reject(error);
        }
      });
    },
    [db]
  );

  // Function to get all values from a specific table
  const getAllValue = (tableName: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      try {
        const store = getTransaction(tableName, "readonly");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Function to insert or update a single value in a specific table
  const putValue = (
    tableName: string,
    value: object
  ): Promise<IDBValidKey | null> => {
    return new Promise((resolve, reject) => {
      try {
        const store = getTransaction(tableName, "readwrite");
        const request = store.put(value);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Function to insert or update multiple values in a specific table
  const putBulkValue = async (
    tableName: string,
    values: object[]
  ): Promise<any[]> => {
    try {
      const store = getTransaction(tableName, "readwrite");
      values.forEach((value) => store.put(value));
      return getAllValue(tableName);
    } catch (error) {
      throw new Error("Bulk insert failed: " + error);
    }
  };

  // Function to update a specific value by ID in a specific table
  const updateValue = ({
    tableName,
    key,
    newItem,
  }: {
    tableName: string;
    key: string;
    newItem: any;
  }) => {
    try {
      const store = getTransaction(tableName, "readwrite");
      const request = store.get(key);
      request.onsuccess = () => {
        const data = request.result;
        const updatedItem = data ? { ...data, ...newItem } : { key, newItem };
        store.put(updatedItem);
      };
    } catch (error) {
      console.error("Update value failed: ", error);
    }
  };

  // Function to delete a specific value by ID from a specific table
  const deleteValue = (tableName: string, key: string): string | null => {
    try {
      const store = getTransaction(tableName, "readwrite");
      store.delete(key);
      return key;
    } catch (error) {
      console.error("Delete value failed: ", error);
      return null;
    }
  };

  // Function to delete all values from a specific table
  const deleteAll = (tableName: string) => {
    try {
      const store = getTransaction(tableName, "readwrite");
      store.clear();
    } catch (error) {
      console.error("Delete all values failed: ", error);
    }
  };

  return {
    getValue,
    getAllValue,
    putValue,
    putBulkValue,
    updateValue,
    deleteValue,
    deleteAll,
    isDBConnecting,
  };
};
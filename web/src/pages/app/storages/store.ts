import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { TBucket } from "@/apis/typing";

export type TFile = {
  Key: string;
  LastModified: string;
  ETag: string;
  ChecksumAlgorithm: any[];
  Size: number;
  StorageClass: string;
  Owner: {
    DisplayName: string;
    ID: string;
  };
  Prefix?: string;
};

type State = {
  currentStorage?: TBucket | undefined;
  setCurrentStorage: (currentStorage: TBucket | undefined) => void;
  prefix?: string;
  setPrefix: (prefix: string) => void;
  maxStorage: number;
  setMaxStorage: (number: number) => void;
};

const useStorageStore = create<State>()(
  devtools(
    immer((set, get) => ({
      currentStorage: undefined,
      setCurrentStorage: (currentStorage) =>
        set((state) => {
          state.currentStorage = currentStorage;
        }),
      prefix: "/",
      setPrefix: (prefix) =>
        set((state) => {
          state.prefix = prefix;
        }),
      maxStorage: 0,
      setMaxStorage: (number) =>
        set((state) => {
          state.maxStorage = number;
        }),
    })),
  ),
);

export default useStorageStore;

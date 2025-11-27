import { create } from "zustand";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

interface SelectedInstanceStore {
  selectedInstanceId: number | null;
  selectedInstanceName: string | null;
  setInstance: (id: number, name: string) => void;
}

export const useSelectedInstanceStore = create<SelectedInstanceStore>(
  (set) => ({
    selectedInstanceId: null,
    selectedInstanceName: null,
    setInstance: (id, name) =>
      set({
        selectedInstanceId: id,
        selectedInstanceName: name,
      }),
  })
);

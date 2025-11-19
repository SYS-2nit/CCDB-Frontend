import { create } from "zustand";

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

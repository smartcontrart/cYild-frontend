import { create } from "zustand";

type AccountingUnitDialogStore = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useAccountingUnitDialogStore = create<AccountingUnitDialogStore>(
  (set) => ({
    open: false,
    setOpen: (open) => set({ open }),
  }),
);

"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAccountingUnitDialogStore } from "@/hooks/store/use-accounting-unit-dialog-store";

export default function Settings() {
  const router = useRouter();
  const setOpen = useAccountingUnitDialogStore((state) => state.setOpen);

  useEffect(() => {
    setOpen(true);
    router.replace("/");
  }, [router, setOpen]);

  return null;
}

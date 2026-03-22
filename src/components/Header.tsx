"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBill } from "@/components/BillProvider";
import { AuthDialog } from "./AuthDialog";
import { UserMenu } from "./UserMenu";
import { SaveReceiptDialog } from "./SaveReceiptDialog";
import { ReceiptHistory } from "./ReceiptHistory";
import { Separator } from "@/components/ui/separator";

export function Header() {
  const { isAuthenticated } = useAuth();
  const { loadReceipt } = useBill();
  const [receiptHistoryOpen, setReceiptHistoryOpen] = React.useState(false);

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-(--breakpoint-2xl) flex h-14 items-center justify-between px-4">
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold leading-tight">
            bill splitter v2
          </h1>
          <span className="text-xs text-muted-foreground">
            created by jasonw
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              <ReceiptHistory
                onLoadReceipt={loadReceipt}
                open={receiptHistoryOpen}
                onOpenChange={setReceiptHistoryOpen}
              />
              <Separator orientation="vertical" className="h-6" />
              <SaveReceiptDialog />
              <Separator orientation="vertical" className="h-6" />
            </>
          )}
          <AuthDialog />
          <UserMenu onOpenSavedReceipts={() => setReceiptHistoryOpen(true)} />
        </div>
      </div>
    </header>
  );
}

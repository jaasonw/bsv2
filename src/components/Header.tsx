"use client";

import React from "react";
import { ReceiptText } from "lucide-react";
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
      <div className="mx-auto flex h-14 max-w-[1360px] items-center justify-between px-4 lg:px-7">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ReceiptText className="h-4.5 w-4.5" />
          </span>
          <div className="flex flex-col leading-tight">
            <h1 className="text-[17px] font-bold">bill splitter</h1>
            <span className="text-[11px] text-muted-foreground">
              created by jasonw
            </span>
          </div>
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

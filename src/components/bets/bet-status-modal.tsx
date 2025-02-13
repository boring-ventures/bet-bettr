import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BetStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bet: {
    id: string;
    statusResult: string;
  } | null;
  onStatusUpdate: (status: "Win" | "Lose" | "Push") => Promise<void>;
}

export function BetStatusModal({
  open,
  onOpenChange,
  onStatusUpdate,
}: BetStatusModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (status: "Win" | "Lose" | "Push") => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(status);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Bet Status</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4">
          <Button
            disabled={isUpdating}
            onClick={() => handleStatusUpdate("Win")}
            className="bg-green-500 hover:bg-green-600"
          >
            Win
          </Button>
          <Button
            disabled={isUpdating}
            onClick={() => handleStatusUpdate("Lose")}
            className="bg-red-500 hover:bg-red-600"
          >
            Lose
          </Button>
          <Button
            disabled={isUpdating}
            onClick={() => handleStatusUpdate("Push")}
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            Push
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
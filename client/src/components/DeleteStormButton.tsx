import { useState } from "react";
import { useDeleteStorm } from "@/hooks/use-storms";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Trash2, Loader2, Lock } from "lucide-react";

interface DeleteStormButtonProps {
  stormId: number;
}

export function DeleteStormButton({ stormId }: DeleteStormButtonProps) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const deleteStorm = useDeleteStorm();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteStorm.mutateAsync({ id: stormId, password });
      toast({
        title: "Deleted",
        description: "Storm log removed successfully",
      });
      setOpen(false);
      setPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-card border-white/10 text-card-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Storm Log?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Enter the owner password to confirm deletion.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Owner password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 bg-background/50 border-white/10"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/10 hover:bg-white/5">Cancel</AlertDialogCancel>
          <Button 
            onClick={handleDelete} 
            disabled={!password || deleteStorm.isPending}
            variant="destructive"
          >
            {deleteStorm.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Log
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateStorm } from "@/hooks/use-storms";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CloudRain, Plus, Upload, Loader2, Lock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

// Frontend validation schema
const formSchema = z.object({
  stormType: z.enum(["MCs", "Supercell", "Single cell", "Multicell"]),
  severity: z.enum(["Low", "Medium", "High", "Extreme"]),
  hailSize: z.string().min(1, "Hail size is required"),
  location: z.string().min(1, "Location is required"),
  characteristics: z.array(z.string()).min(1, "Select at least one characteristic"),
  password: z.string().min(1, "Password is required"),
  media: z.any(), // handled manually for file input
});

type FormValues = z.infer<typeof formSchema>;

const CHARACTERISTICS = [
  "Heavy Rain",
  "High Winds",
  "Lightning",
  "Hail",
  "Flash Flooding",
  "Tornado",
  "Dust Storm",
];

export function CreateStormDialog() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const { toast } = useToast();
  const createStorm = useCreateStorm();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stormType: "Single cell",
      severity: "Medium",
      hailSize: "None",
      location: "UAE",
      characteristics: [],
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    formData.append("stormType", data.stormType);
    formData.append("severity", data.severity);
    formData.append("hailSize", data.hailSize);
    formData.append("location", data.location);
    formData.append("password", data.password);
    
    // Append characteristics as individual entries
    data.characteristics.forEach((char) => {
      formData.append("characteristics", char);
    });

    // Append files
    if (files) {
      Array.from(files).forEach((file) => {
        formData.append("media", file);
      });
    }

    try {
      await createStorm.mutateAsync(formData);
      toast({
        title: "Storm Logged",
        description: "The storm has been successfully recorded.",
      });
      setOpen(false);
      form.reset();
      setFiles(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log storm",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl group">
          <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
          Log New Storm
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-card border-white/10 text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display flex items-center gap-2">
            <CloudRain className="h-6 w-6 text-primary" />
            Log Storm Event
          </DialogTitle>
          <DialogDescription>
            Record details about a recent weather event in the UAE. Password required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stormType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Storm Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 border-white/10">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Single cell">Single cell</SelectItem>
                        <SelectItem value="Multicell">Multicell</SelectItem>
                        <SelectItem value="Supercell">Supercell</SelectItem>
                        <SelectItem value="MCs">MCs (Mesoscale Convective)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 border-white/10">
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Extreme">Extreme</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hailSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hail Size</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. 2cm or None" className="bg-background/50 border-white/10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Dubai Marina" className="bg-background/50 border-white/10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="characteristics"
              render={() => (
                <FormItem>
                  <FormLabel className="mb-4 block">Characteristics</FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {CHARACTERISTICS.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="characteristics"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item
                                          )
                                        );
                                  }}
                                  className="border-white/20 data-[state=checked]:bg-primary"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                                {item}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Media (Photos/Videos)</FormLabel>
              <FormControl>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-white/5 border-white/20 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {files ? `${files.length} files selected` : "Images or Videos"}
                      </p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      multiple 
                      accept="image/*,video/*"
                      onChange={(e) => setFiles(e.target.files)} 
                    />
                  </label>
                </div>
              </FormControl>
            </FormItem>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Authentication Required
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="password" 
                        placeholder="Enter password to submit" 
                        {...field} 
                        className="pl-9 bg-background/50 border-white/10" 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={createStorm.isPending} className="w-full sm:w-auto">
                {createStorm.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log Storm
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

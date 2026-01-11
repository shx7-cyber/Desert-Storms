import { StormResponse } from "@/hooks/use-storms";
import { format } from "date-fns";
import { MapPin, Calendar, CloudLightning, Ruler, Activity, Film, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteStormButton } from "./DeleteStormButton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";

export function StormCard({ storm }: { storm: StormResponse }) {
  const isSevere = storm.severity === "High" || storm.severity === "Extreme";
  const formattedDate = storm.createdAt 
    ? format(new Date(storm.createdAt), "PPP 'at' p")
    : "Date unknown";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        group relative overflow-hidden rounded-2xl bg-card border transition-all duration-300
        ${isSevere ? 'border-red-500/20 shadow-lg shadow-red-900/10' : 'border-white/5 shadow-lg shadow-black/20'}
        hover:border-primary/30 hover:shadow-primary/5
      `}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="storm" className="uppercase tracking-wider text-[10px]">
                {storm.stormType}
              </Badge>
              {isSevere && (
                <Badge variant="severe" className="uppercase tracking-wider text-[10px] animate-pulse">
                  Severe Warning
                </Badge>
              )}
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground leading-tight">
              {storm.location}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm">
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              {formattedDate}
            </div>
          </div>
          <DeleteStormButton stormId={storm.id} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-background/40 rounded-lg p-3 border border-white/5">
            <div className="text-xs text-muted-foreground flex items-center mb-1">
              <Activity className="h-3 w-3 mr-1.5 text-primary" /> Severity
            </div>
            <div className={`font-semibold ${isSevere ? "text-red-400" : "text-foreground"}`}>
              {storm.severity}
            </div>
          </div>
          <div className="bg-background/40 rounded-lg p-3 border border-white/5">
            <div className="text-xs text-muted-foreground flex items-center mb-1">
              <Ruler className="h-3 w-3 mr-1.5 text-blue-400" /> Hail Size
            </div>
            <div className="font-semibold text-foreground">
              {storm.hailSize}
            </div>
          </div>
        </div>

        {/* Characteristics */}
        {storm.characteristics && storm.characteristics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {storm.characteristics.map((char, idx) => (
              <Badge key={idx} variant="secondary" className="bg-secondary/50 font-normal">
                {char}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Media Gallery */}
      {storm.mediaUrls && storm.mediaUrls.length > 0 ? (
        <div className="bg-black/40 border-t border-white/5 p-4">
          <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
            <ImageIcon className="h-3.5 w-3.5" /> Media Gallery
          </div>
          <Carousel className="w-full">
            <CarouselContent>
              {storm.mediaUrls.map((url, index) => (
                <CarouselItem key={index} className="basis-full">
                  <div className="aspect-video relative rounded-lg overflow-hidden bg-black/50 border border-white/10 group-hover:border-primary/20 transition-colors">
                    {url.match(/\.(mp4|webm|mov)$/i) ? (
                      <video 
                        src={url} 
                        controls 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <img 
                        src={url} 
                        alt={`Storm media ${index + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {storm.mediaUrls.length > 1 && (
              <>
                <CarouselPrevious className="left-2 bg-black/50 border-white/10 hover:bg-black/70 text-white" />
                <CarouselNext className="right-2 bg-black/50 border-white/10 hover:bg-black/70 text-white" />
              </>
            )}
          </Carousel>
        </div>
      ) : (
        <div className="bg-background/30 p-4 border-t border-white/5 flex items-center justify-center text-muted-foreground text-sm italic h-24">
          No media attached
        </div>
      )}
    </motion.div>
  );
}

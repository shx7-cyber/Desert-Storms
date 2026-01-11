import { StormResponse } from "@/hooks/use-storms";
import { format } from "date-fns";
import { MapPin, Calendar, CloudLightning, Ruler, Activity, Film, Image as ImageIcon, Download, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteStormButton } from "./DeleteStormButton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function StormCard({ storm }: { storm: StormResponse }) {
  const isSevere = storm.severity === "High" || storm.severity === "Extreme";
  const formattedDate = storm.createdAt 
    ? format(new Date(storm.createdAt), "PPP 'at' p")
    : "Date unknown";

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'storm-media';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
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
        <div className="bg-black/40 border-t border-white/5 p-4 space-y-4">
          {storm.mediaUrls && storm.mediaUrls.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                <ImageIcon className="h-3.5 w-3.5" /> Media Gallery
              </div>
              <Carousel className="w-full">
                <CarouselContent>
                  {storm.mediaUrls.map((url, index) => (
                    <CarouselItem key={index} className="basis-full">
                      <div className="aspect-video relative rounded-lg overflow-hidden bg-black/50 border border-white/10 group-hover:border-primary/20 transition-colors cursor-pointer">
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
                            onClick={() => setSelectedImage(url)}
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
          )}

          {storm.radarUrls && storm.radarUrls.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                <Activity className="h-3.5 w-3.5" /> Radar Screenshots
              </div>
              <Carousel className="w-full">
                <CarouselContent>
                  {storm.radarUrls.map((url, index) => (
                    <CarouselItem key={index} className="basis-full">
                      <div className="aspect-video relative rounded-lg overflow-hidden bg-black/50 border border-white/10 group-hover:border-primary/20 transition-colors cursor-pointer">
                        <img 
                          src={url} 
                          alt={`Radar screenshot ${index + 1}`} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onClick={() => setSelectedImage(url)}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {storm.radarUrls.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2 bg-black/50 border-white/10 hover:bg-black/70 text-white" />
                    <CarouselNext className="right-2 bg-black/50 border-white/10 hover:bg-black/70 text-white" />
                  </>
                )}
              </Carousel>
            </div>
          )}

          {(!storm.mediaUrls || storm.mediaUrls.length === 0) && (!storm.radarUrls || storm.radarUrls.length === 0) && (
            <div className="bg-background/30 p-4 flex items-center justify-center text-muted-foreground text-sm italic h-24 rounded-lg">
              No media attached
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10"
                  onClick={() => handleDownload(selectedImage)}
                >
                  <Download className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <img
                src={selectedImage}
                alt="Fullscreen storm media"
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

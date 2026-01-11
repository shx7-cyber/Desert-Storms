import { useStorms } from "@/hooks/use-storms";
import { CreateStormDialog } from "@/components/CreateStormDialog";
import { StormCard } from "@/components/StormCard";
import { CloudLightning, Loader2, Wind, Droplets, AlertTriangle, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { format, isToday, isYesterday, startOfDay } from "date-fns";

export default function Dashboard() {
  const { data: storms, isLoading, error } = useStorms();

  // Group storms by date
  const groupedStorms = storms?.reduce((acc: Record<string, any[]>, storm) => {
    const date = storm.createdAt ? startOfDay(new Date(storm.createdAt)).toISOString() : 'unknown';
    if (!acc[date]) acc[date] = [];
    acc[date].push(storm);
    return acc;
  }, {});

  const sortedDates = groupedStorms 
    ? Object.keys(groupedStorms).sort((a, b) => b.localeCompare(a)) 
    : [];

  const getDateLabel = (dateStr: string) => {
    if (dateStr === 'unknown') return 'Unknown Date';
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM do, yyyy');
  };

  // Calculate quick stats
  const totalStorms = storms?.length || 0;
  const severeCount = storms?.filter(s => s.severity === 'High' || s.severity === 'Extreme').length || 0;
  const uniqueLocations = new Set(storms?.map(s => s.location)).size || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin" />
          <p className="text-lg font-medium animate-pulse">Scanning Radar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-destructive">
        <div className="text-center p-8 border border-destructive/20 rounded-2xl bg-destructive/5">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">System Error</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-background to-background">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <CloudLightning className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground">UAE Weather Surveillance</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-none mb-4">
              Storm <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Log</span>
            </h1>
            <p className="text-muted-foreground max-w-lg text-lg">
              Official centralized registry for tracking severe weather events across the Emirates.
            </p>
          </div>
          <CreateStormDialog />
        </div>

        {/* Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <StatsCard 
            icon={<CloudLightning className="h-5 w-5 text-blue-400" />} 
            label="Total Events" 
            value={totalStorms} 
          />
          <StatsCard 
            icon={<AlertTriangle className="h-5 w-5 text-red-400" />} 
            label="Severe Alerts" 
            value={severeCount} 
          />
          <StatsCard 
            icon={<MapPin className="h-5 w-5 text-emerald-400" />} 
            label="Locations Affected" 
            value={uniqueLocations} 
          />
          <StatsCard 
            icon={<Wind className="h-5 w-5 text-purple-400" />} 
            label="Active Monitoring" 
            value="Active"
            valueClass="text-green-400 text-sm font-mono tracking-widest uppercase"
          />
        </motion.div>

        {/* Content Grid */}
        {sortedDates.length > 0 ? (
          <div className="space-y-12">
            {sortedDates.map((dateStr) => (
              <div key={dateStr} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-white/90 font-display flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                    {getDateLabel(dateStr)}
                  </h2>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedStorms[dateStr].map((storm: any) => (
                    <StormCard key={storm.id} storm={storm} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
            <CloudLightning className="h-16 w-16 mx-auto mb-6 text-muted-foreground/30" />
            <h3 className="text-xl font-medium text-foreground mb-2">No Storms Detected</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              The skies are currently clear. Log a new storm event to start tracking weather patterns.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatsCard({ icon, label, value, valueClass = "text-2xl font-bold font-display" }: any) {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-white/5 p-4 rounded-xl flex flex-col justify-between h-28 hover:bg-card/80 transition-colors">
      <div className="flex justify-between items-start">
        <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">{label}</span>
        {icon}
      </div>
      <div className={valueClass}>{value}</div>
    </div>
  );
}

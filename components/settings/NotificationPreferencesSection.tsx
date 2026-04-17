import { Bell, MapPin, TrendingDown, FileText, RefreshCw, Clock, Volume2, VolumeX } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotificationPreferences } from "@/hooks/useNotifications";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  {
    key: "changes_since_last_visit" as const,
    icon: RefreshCw,
    label: "What changed since last visit",
    desc: "Summary of updates since you were last here",
  },
  {
    key: "new_permit_nearby" as const,
    icon: MapPin,
    label: "New permit near watched entities",
    desc: "Drilling permits filed near your minerals",
  },
  {
    key: "production_anomaly" as const,
    icon: TrendingDown,
    label: "Production anomaly",
    desc: "Unusual changes in production volumes",
  },
  {
    key: "new_report_available" as const,
    icon: FileText,
    label: "New report available",
    desc: "Fresh analysis or regulatory filings",
  },
];

const FREQUENCIES = [
  { value: "realtime", label: "Real-time" },
  { value: "daily_digest", label: "Daily digest" },
  { value: "weekly_digest", label: "Weekly digest" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0");
  return { value: `${h}:00`, label: `${h}:00` };
});

export function NotificationPreferencesSection() {
  const { prefs, loading, updatePrefs } = useNotificationPreferences();

  if (loading) {
    return (
      <section className="mb-8">
        <h2 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notification Preferences
        </h2>
        <div className="calm-card space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (!prefs) return null;

  return (
    <section className="mb-8">
      <h2 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
        <Bell className="w-4 h-4" />
        Notification Preferences
      </h2>

      {/* Category toggles */}
      <div className="calm-card space-y-0 divide-y divide-border/50">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{cat.label}</p>
                  <p className="text-xs text-muted-foreground">{cat.desc}</p>
                </div>
              </div>
              <Switch
                checked={prefs[cat.key]}
                onCheckedChange={(val) => updatePrefs({ [cat.key]: val })}
              />
            </div>
          );
        })}
      </div>

      {/* Delivery & Frequency */}
      <div className="calm-card mt-4 space-y-5">
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Delivery</p>
          <p className="text-xs text-muted-foreground mb-3">Choose how you receive notifications</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">In-app inbox</span>
              </div>
              <Switch
                checked={prefs.in_app_enabled}
                onCheckedChange={(val) => updatePrefs({ in_app_enabled: val })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-foreground">Push notifications</span>
                  <p className="text-xs text-muted-foreground">Requires browser/PWA permission</p>
                </div>
              </div>
              <Switch
                checked={prefs.push_enabled}
                onCheckedChange={(val) => updatePrefs({ push_enabled: val })}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 pt-5">
          <p className="text-sm font-medium text-foreground mb-1">Frequency</p>
          <p className="text-xs text-muted-foreground mb-3">How often should we bundle updates?</p>
          <Select
            value={prefs.frequency}
            onValueChange={(val) => updatePrefs({ frequency: val as typeof prefs.frequency })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCIES.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quiet hours */}
        <div className="border-t border-border/50 pt-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {prefs.quiet_hours_enabled ? (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Clock className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">Quiet hours</p>
                <p className="text-xs text-muted-foreground">Pause notifications during these hours</p>
              </div>
            </div>
            <Switch
              checked={prefs.quiet_hours_enabled}
              onCheckedChange={(val) => updatePrefs({ quiet_hours_enabled: val })}
            />
          </div>

          {prefs.quiet_hours_enabled && (
            <div className="flex items-center gap-3 animate-fade-in">
              <Select
                value={prefs.quiet_hours_start}
                onValueChange={(val) => updatePrefs({ quiet_hours_start: val })}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">to</span>
              <Select
                value={prefs.quiet_hours_end}
                onValueChange={(val) => updatePrefs({ quiet_hours_end: val })}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

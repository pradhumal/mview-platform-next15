import { useState } from "react";
import { Bell, CheckCheck, Trash2, MapPin, TrendingDown, FileText, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useNotifications, type AppNotification, type NotificationCategory } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const CATEGORY_META: Record<NotificationCategory, { icon: typeof Bell; label: string }> = {
  changes_since_last_visit: { icon: RefreshCw, label: "What's changed" },
  new_permit_nearby: { icon: MapPin, label: "Permit nearby" },
  production_anomaly: { icon: TrendingDown, label: "Production anomaly" },
  new_report_available: { icon: FileText, label: "New report" },
};

function NotificationItem({
  notification,
  onRead,
  onDelete,
  onNavigate,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (url: string) => void;
}) {
  const meta = CATEGORY_META[notification.category];
  const Icon = meta.icon;

  return (
    <div
      className={`p-4 border-b border-border/50 transition-colors cursor-pointer ${
        notification.is_read ? "opacity-70" : "bg-primary/5"
      }`}
      onClick={() => {
        if (!notification.is_read) onRead(notification.id);
        if (notification.action_url) onNavigate(notification.action_url);
      }}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          notification.is_read ? "bg-muted" : "bg-primary/10"
        }`}>
          <Icon className={`w-4 h-4 ${notification.is_read ? "text-muted-foreground" : "text-primary"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">{meta.label}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-sm font-medium text-foreground mt-0.5">{notification.title}</p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.body}</p>
          <p className="text-2xs text-muted-foreground/70 mt-1.5">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}

export function NotificationInbox() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-2xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs gap-1.5">
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">All caught up</p>
              <p className="text-xs text-muted-foreground">
                We'll notify you about activity near your minerals.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={markAsRead}
                onDelete={deleteNotification}
                onNavigate={handleNavigate}
              />
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

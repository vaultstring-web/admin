'use client';

import { useState } from 'react';
import { Notification, NotificationType, NotificationStatus } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Shield, 
  Bell, 
  XCircle, 
  Check, 
  Inbox
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete
}) => {
  const [filter, setFilter] = useState<NotificationStatus | 'ALL'>('ALL');
  
  const filteredNotifications = notifications.filter(notification => 
    filter === 'ALL' || notification.status === filter
  );

  const unreadCount = notifications.filter(n => n.status === NotificationStatus.UNREAD).length;

  const getStatusConfig = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
      case NotificationType.ERROR:
        return { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
      case NotificationType.WARNING:
        return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
      case NotificationType.SECURITY:
        return { icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' };
      case NotificationType.SYSTEM:
        return { icon: Info, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
      default:
        return { icon: Bell, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
    }
  };

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-950 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-6 border-b border-slate-50 dark:border-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-emerald-600" />
            <CardTitle className="text-lg font-black tracking-tight uppercase">Event Feed</CardTitle>
          </div>
          <CardDescription className="text-xs font-medium text-slate-500 italic">
            {unreadCount > 0 ? `Awaiting review: ${unreadCount} priority signals` : 'System state synchronized. No pending alerts.'}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onMarkAllAsRead}
              className="h-8 text-[10px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-500 hover:text-white transition-all"
            >
              <Check className="h-3 w-3 mr-2" strokeWidth={3} />
              Acknowledge All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Filter Toolbar */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-fit mb-8">
          {(['ALL', NotificationStatus.UNREAD, NotificationStatus.READ] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                filter === s 
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full ring-1 ring-slate-100 dark:ring-slate-800">
                <Inbox className="h-8 w-8 text-slate-200 dark:text-slate-700" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Zero Signals Detected</p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const config = getStatusConfig(n.type);
              const isUnread = n.status === NotificationStatus.UNREAD;
              
              return (
                <div
                  key={n.id}
                  className={cn(
                    "relative group p-4 rounded-2xl border transition-all duration-300",
                    isUnread 
                      ? "bg-emerald-50/30 dark:bg-emerald-500/5 border-emerald-500/20 shadow-sm shadow-emerald-500/5"
                      : "bg-transparent border-slate-100 dark:border-slate-800 opacity-80 hover:opacity-100"
                  )}
                >
                  {isUnread && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-emerald-500 rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={cn("p-2.5 rounded-xl shrink-0", config.bg)}>
                      <config.icon className={cn("h-4 w-4", config.color)} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-black text-[13px] tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                          {n.title}
                        </h4>
                        <Badge variant="outline" className={cn("text-[9px] font-black tracking-widest uppercase border-transparent px-1.5 h-4", config.bg, config.color)}>
                          {n.type}
                        </Badge>
                        {isUnread && (
                          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[8px] font-black uppercase tracking-tighter animate-pulse">
                            Live Signal
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-3 max-w-2xl">
                        {n.message}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-900">
                        <span className="text-[10px] font-bold text-slate-400 font-mono flex items-center gap-1.5 uppercase tracking-tighter">
                          <CheckCircle2 size={10} className="text-emerald-500" />
                          {format(new Date(n.timestamp), 'dd MMM HH:mm:ss')}
                        </span>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isUnread && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[10px] font-black uppercase text-slate-500"
                              onClick={() => onMarkAsRead(n.id)}
                            >
                              Archive
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] font-black uppercase text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                            onClick={() => onDelete(n.id)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

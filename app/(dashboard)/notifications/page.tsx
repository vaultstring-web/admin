'use client';

import { useState, useEffect } from 'react';
import { NotificationList } from '@/components/notifications/NotificationList';
import { NotificationStats } from '@/components/notifications/NotificationStats';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';
import { archiveNotification, getNotifications, markAllNotificationsRead, markNotificationRead } from '@/lib/api';
import { Notification, NotificationStatus } from '@/components/notifications/types';
import { Bell, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getNotifications();
        if (response.data) {
          // Cast strictly because api.ts Notification might be slightly different or missing enums
          setNotifications(response.data.notifications as unknown as Notification[]);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkAsRead = (id: string) => {
    void (async () => {
      const res = await markNotificationRead(id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, status: NotificationStatus.READ, readAt: new Date().toISOString() }
            : notification
        )
      );
    })();
  };

  const handleMarkAllAsRead = () => {
    void (async () => {
      const res = await markAllNotificationsRead();
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          status: NotificationStatus.READ,
          readAt: new Date().toISOString()
        }))
      );
    })();
  };

  const handleDelete = (id: string) => {
    void (async () => {
      const res = await archiveNotification(id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    })();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bell className="h-8 w-8" />
          Notifications
        </h1>
        <p className="text-muted-foreground mt-2">
          Stay updated with system alerts, transactions, and important updates
        </p>
      </div>

      <NotificationStats notifications={notifications} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NotificationList
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDelete={handleDelete}
          />
        </div>

        <div>
          <NotificationPreferences />
        </div>
      </div>
    </div>
  );
}

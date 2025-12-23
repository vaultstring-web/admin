'use client';

import { useState } from 'react';
import { NotificationList } from '@/components/notifications/NotificationList';
import { NotificationStats } from '@/components/notifications/NotificationStats';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';
import { MOCK_NOTIFICATIONS } from '@/components/notifications/constants';
import { Notification, NotificationStatus } from '@/components/notifications/types';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, status: NotificationStatus.READ, readAt: new Date().toISOString() }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({
        ...notification,
        status: NotificationStatus.READ,
        readAt: new Date().toISOString()
      }))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

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
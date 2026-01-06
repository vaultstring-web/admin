export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  SECURITY = 'security',
  PAYMENT = 'payment',
  VERIFICATION = 'verification',
  SYSTEM = 'system'
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived'
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  timestamp: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  readAt?: string;
}

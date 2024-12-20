interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface ManufacturerNotificationsProps {
  notifications: Notification[] | null;
}

export const ManufacturerNotifications = ({ notifications }: ManufacturerNotificationsProps) => {
  return (
    <div className="space-y-4">
      {notifications?.map((notification) => (
        <div
          key={notification.id}
          className={`glass-card p-6 ${!notification.is_read ? 'border-primary' : ''}`}
        >
          <h3 className="font-semibold">{notification.title}</h3>
          <p className="text-sm text-muted-foreground">
            {new Date(notification.created_at).toLocaleDateString()}
          </p>
          <p className="mt-2">{notification.message}</p>
        </div>
      ))}
      {(!notifications || notifications.length === 0) && (
        <div className="text-center py-8 text-muted-foreground">
          No notifications yet.
        </div>
      )}
    </div>
  );
};
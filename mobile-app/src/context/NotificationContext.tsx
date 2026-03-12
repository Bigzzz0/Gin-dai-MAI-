import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // ms, 0 = persistent until dismissed
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  dismissNotification: (id: string) => void;
  dismissAll: () => void;
  notifications: Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notif_${Date.now()}_${Math.random()}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 4000, // Default 4 seconds
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-dismiss if duration > 0
    if (newNotification.duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, newNotification.duration);
    }
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, dismissNotification, dismissAll, notifications }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

function NotificationContainer() {
  const { notifications, dismissNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={() => dismissNotification(notification.id)}
          index={index}
        />
      ))}
    </View>
  );
}

function NotificationItem({
  notification,
  onDismiss,
  index,
}: {
  notification: Notification;
  onDismiss: () => void;
  index: number;
}) {
  const anim = new Animated.Value(-100);

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle color="#10b981" size={24} />;
      case 'error':
        return <AlertCircle color="#ef4444" size={24} />;
      case 'warning':
        return <AlertCircle color="#f59e0b" size={24} />;
      default:
        return <Info color="#3b82f6" size={24} />;
    }
  };

  const getGradient = () => {
    switch (notification.type) {
      case 'success':
        return ['#f0fdf4', '#dcfce7'];
      case 'error':
        return ['#fef2f2', '#fee2e2'];
      case 'warning':
        return ['#fffbeb', '#fef3c7'];
      default:
        return ['#eff6ff', '#dbeafe'];
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  };

  return (
    <Animated.View
      style={[
        styles.notificationItem,
        {
          transform: [{ translateY: anim }],
          marginTop: index === 0 ? 0 : 8,
        },
      ]}
    >
      <LinearGradient
        colors={getGradient()}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={[styles.content, { borderColor: getBorderColor() }]}>
        <View style={styles.iconContainer}>{getIcon()}</View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{notification.title}</Text>
          {notification.message && (
            <Text style={styles.message} numberOfLines={3}>
              {notification.message}
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss} activeOpacity={0.7}>
          <X color="#64748b" size={18} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  notificationItem: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    padding: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Kanit_600SemiBold',
    fontSize: 15,
    color: '#0f172a',
    marginBottom: 4,
  },
  message: {
    fontFamily: 'Kanit_400Regular',
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
};

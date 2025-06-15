
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useErrorHandler } from './useErrorHandler';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    // Check if push notifications are supported
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
    
    if (isSupported) {
      checkExistingSubscription();
    }
  }, [isSupported, user]);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        setIsSubscribed(true);
        setSubscription({
          endpoint: existingSubscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(existingSubscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(existingSubscription.getKey('auth')!)
          }
        });
      }
    } catch (error) {
      handleError(error, 'checking push subscription');
    }
  };

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        await subscribeToPush();
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive push notifications',
        });
      } else {
        toast({
          title: 'Permission Denied',
          description: 'Push notifications are disabled',
          variant: 'destructive'
        });
      }
    } catch (error) {
      handleError(error, 'requesting notification permission');
    }
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // In a real implementation, you would get this key from your backend
      const vapidPublicKey = 'your-vapid-public-key';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      // Store subscription in database
      if (user) {
        await supabase
          .from('user_notifications')
          .upsert({
            user_id: user.id,
            title: 'Push Subscription',
            message: 'User subscribed to push notifications',
            notification_type: 'system',
            metadata: { subscription: subscriptionData }
          });
      }

      setIsSubscribed(true);
      setSubscription(subscriptionData);
    } catch (error) {
      handleError(error, 'subscribing to push notifications');
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        setIsSubscribed(false);
        setSubscription(null);
        
        toast({
          title: 'Unsubscribed',
          description: 'Push notifications have been disabled',
        });
      }
    } catch (error) {
      handleError(error, 'unsubscribing from push notifications');
    }
  };

  // Helper functions
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    return btoa(binary);
  };

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return {
    isSupported,
    isSubscribed,
    subscription,
    requestPermission,
    unsubscribe
  };
};

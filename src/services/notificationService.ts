export const sendSecurityAlert = async (alertType: string, details: Record<string, any>) => {
  // Log security alert for monitoring
  console.warn('Security Alert:', { alertType, details, timestamp: new Date().toISOString() });
  
  // In a real application, this would send to monitoring service
  // For now, we'll just log it
  
  return Promise.resolve({ success: true, alertId: Date.now().toString() });
};

export const sendWelcomeNotification = async (userId: string, userDetails?: Record<string, any>) => {
  console.log('Welcome notification sent to user:', userId, userDetails);
  
  // In a real application, this would send to notification service
  return Promise.resolve({ success: true, notificationId: Date.now().toString() });
};

export const sendVerificationNotification = async (phone: string, code: string) => {
  console.log('Verification notification sent to:', phone, 'with code:', code);
  
  // In a real application, this would send SMS/email
  return Promise.resolve({ success: true, notificationId: Date.now().toString() });
};

export const logSecurityEvent = (event: string, metadata?: Record<string, any>) => {
  const securityEvent = {
    event,
    metadata,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.log('Security Event:', securityEvent);
  
  // Store in local storage for debugging (in production, send to monitoring service)
  const events = JSON.parse(localStorage.getItem('security-events') || '[]');
  events.push(securityEvent);
  
  // Keep only last 100 events
  if (events.length > 100) {
    events.splice(0, events.length - 100);
  }
  
  localStorage.setItem('security-events', JSON.stringify(events));
};


import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type ErrorWithMessage = {
  message: string;
  code?: string | number;
  details?: any;
};

export const useErrorHandler = () => {
  const { toast } = useToast();

  // Helper to determine if the error has a message property
  const isErrorWithMessage = (error: unknown): error is ErrorWithMessage => {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as Record<string, unknown>).message === 'string'
    );
  };

  // Helper to convert unknown errors to a standard format
  const toErrorWithMessage = (maybeError: unknown): ErrorWithMessage => {
    if (isErrorWithMessage(maybeError)) return maybeError;
    
    try {
      // Try to stringify the error if possible
      return new Error(JSON.stringify(maybeError));
    } catch {
      // If all else fails, return a generic error
      return new Error('An unknown error occurred');
    }
  };

  // Log error to backend if needed
  const logError = useCallback(async (error: ErrorWithMessage, context?: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      const errorDetails = {
        message: error.message,
        code: error.code,
        details: error.details,
        context,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        url: window.location.href
      };
      
      const { error: logError } = await supabase
        .from('error_logs')
        .insert({
          user_id: userId,
          error_message: error.message,
          error_type: context || 'app_error',
          error_details: errorDetails
        });
        
      if (logError) {
        console.error('Failed to log error to database:', logError);
        // Fallback: at least log to console with full context
        console.error('Original error details:', errorDetails);
      }
    } catch (e) {
      console.error('Exception while logging error:', e);
      // Graceful degradation - app continues to work even if error logging fails
    }
  }, []);

  // Main handler function
  const handleError = useCallback((error: unknown, context?: string) => {
    const errorWithMessage = toErrorWithMessage(error);
    
    console.error(`Error in ${context || 'application'}:`, errorWithMessage);
    
    // Show user-friendly toast notification
    toast({
      title: 'Error',
      description: errorWithMessage.message,
      variant: 'destructive',
    });
    
    // Log error to backend
    logError(errorWithMessage, context);
    
    return errorWithMessage;
  }, [toast, logError]);

  return { handleError };
};

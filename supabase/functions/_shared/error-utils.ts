// Utility functions for error handling in edge functions
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

export function createErrorResponse(message: string, status = 500, corsHeaders: Record<string, string> = {}) {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

export function logError(context: string, error: unknown, details?: any) {
  console.error(`[${context}] Error:`, error);
  if (details) {
    console.error(`[${context}] Details:`, details);
  }
}
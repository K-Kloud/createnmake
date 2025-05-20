
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface OptimisticMutationOptions<TData = any, TVariables = any, TContext = any> {
  // Function that performs the actual API call
  mutationFn: (variables: TVariables) => Promise<TData>;
  
  // Query key for invalidation after mutation
  queryKey: unknown[];
  
  // Optional transformer function to transform result
  transformResult?: (data: TData) => any;
  
  // Function to get the optimistic update value
  getOptimisticValue: (variables: TVariables) => TData;
  
  // Success message
  successMessage?: string;
  
  // Error message
  errorMessage?: string;
  
  // Function to build context for rollback
  buildContext?: (variables: TVariables, previousData: any) => TContext;
  
  // Function to handle successful mutation
  onSuccess?: (data: TData, variables: TVariables, context: TContext) => void;
  
  // Function to handle failed mutation
  onError?: (error: Error, variables: TVariables, context: TContext) => void;
}

export function useOptimisticMutation<TData = any, TVariables = any, TContext = any>({
  mutationFn,
  queryKey,
  transformResult,
  getOptimisticValue,
  successMessage,
  errorMessage,
  buildContext,
  onSuccess,
  onError,
}: OptimisticMutationOptions<TData, TVariables, TContext>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const mutation = useMutation({
    mutationFn,
    
    // Handle optimistic updates
    onMutate: async (variables) => {
      setIsPending(true);
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);
      
      // Optimistically update to the new value
      const optimisticValue = getOptimisticValue(variables);
      queryClient.setQueryData(queryKey, optimisticValue);
      
      // Return a context object with the snapshot
      return buildContext ? buildContext(variables, previousData) : { previousData };
    },
    
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error, variables, context: any) => {
      queryClient.setQueryData(queryKey, context?.previousData);
      
      if (errorMessage) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      if (onError) {
        onError(error as Error, variables, context);
      }
      
      setIsPending(false);
    },
    
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    
    // On success, transform the result if needed and call onSuccess callback
    onSuccess: (data, variables, context) => {
      const result = transformResult ? transformResult(data) : data;
      
      if (successMessage) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }
      
      if (onSuccess) {
        onSuccess(result as TData, variables, context as TContext);
      }
      
      setIsPending(false);
    },
  });

  return {
    ...mutation,
    isPending,
  };
}

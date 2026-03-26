import { toast as sonnerToast } from 'sonner';

export interface Toast {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toast = (options: Toast) => {
    if (options.variant === 'destructive') {
      sonnerToast.error(options.title || 'Error', {
        description: options.description,
      });
    } else {
      sonnerToast.success(options.title || 'Success', {
        description: options.description,
      });
    }
  };

  return { toast };
}

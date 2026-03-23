/**
 * Date utility functions for the Satguru SmartShop.
 */

/**
 * Calculates the number of days between two dates.
 */
export const getDaysUntil = (targetDateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(targetDateStr);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Formats a date string for display.
 */
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

/**
 * Checks if a date is today.
 */
export const isToday = (dateStr: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
};

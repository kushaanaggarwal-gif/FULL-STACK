import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectNotification, clearNotification } from '../features/ui/uiSlice';

export const Toast = () => {
  const dispatch = useAppDispatch();
  const notification = useAppSelector(selectNotification);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        dispatch(clearNotification());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, dispatch]);

  if (!notification) return null;

  return (
    <div className={`toast-notice ${notification.type === 'error' ? 'error' : notification.type === 'success' ? 'success' : ''}`}>
      {notification.message}
    </div>
  );
};

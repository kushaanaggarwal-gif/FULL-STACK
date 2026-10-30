import { useState, useCallback } from 'react';
import { initialEvents } from '../utils/mockData';
import type { CalendarEvent } from '../utils/mockData';

export const useEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);

  const handleEventMove = useCallback((eventId: string, newDate: string) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId ? { ...event, date: newDate } : event
      )
    );
  }, []);

  const addEvent = useCallback((title: string, date: string, isImportant: boolean) => {
    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title,
      date,
      isImportant,
      isCompleted: false,
    };
    setEvents(prev => [...prev, newEvent]);
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  }, []);

  const updateEvent = useCallback((eventId: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(e => (e.id === eventId ? { ...e, ...updates } : e)));
  }, []);

  return {
    events,
    handleEventMove,
    addEvent,
    deleteEvent,
    updateEvent,
  };
};

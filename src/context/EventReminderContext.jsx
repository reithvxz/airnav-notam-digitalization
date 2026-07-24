import React, { createContext, useContext, useEffect, useState } from 'react';

const EventReminderContext = createContext();

export function useEventReminders() {
  return useContext(EventReminderContext);
}

export function EventReminderProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [notified, setNotified] = useState(new Set()); // Store notified keys like "eventId-reminderType"

  useEffect(() => {
    // Request browser notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/events');
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (err) {
        console.error('Failed to fetch events for reminders', err);
      }
    };

    fetchEvents();
    // Refresh events every 5 minutes in case another tab adds one
    const fetchInterval = setInterval(fetchEvents, 5 * 60 * 1000);
    return () => clearInterval(fetchInterval);
  }, []);

  useEffect(() => {
    if (events.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      
      events.forEach(ev => {
        let eventDate;
        if (ev.isAllDay) {
          // All-day event: use 00:00 of that day
          eventDate = new Date(`${ev.date}T00:00:00`);
        } else {
          eventDate = new Date(`${ev.date}T${ev.startTime || '00:00'}:00`);
        }

        const diffMs = eventDate - now;
        const diffHours = diffMs / (1000 * 60 * 60);
        const diffDays = diffHours / 24;

        // Toleransi waktu pengecekan (misal 1 menit = 0.016 jam)
        const checkAndNotify = (targetDays, targetHours, typeName, message) => {
          const targetTotalHours = targetDays * 24 + targetHours;
          const notifyKey = `${ev.id}-${typeName}`;
          
          if (!notified.has(notifyKey)) {
            // Check if the current time difference is within a very close threshold to the target
            // e.g., if we are within 5 minutes of the target reminder time
            const diffFromTarget = Math.abs(diffHours - targetTotalHours);
            if (diffFromTarget <= (5 / 60)) { // 5 minutes threshold
              showNotification(`Reminder: ${ev.title}`, message);
              setNotified(prev => new Set(prev).add(notifyKey));
            }
          }
        };

        // H-7 days
        checkAndNotify(7, 0, 'H-7', `Agenda "${ev.title}" akan dimulai dalam 7 hari.`);
        // H-3 days
        checkAndNotify(3, 0, 'H-3', `Agenda "${ev.title}" akan dimulai dalam 3 hari.`);
        // H-2 days
        checkAndNotify(2, 0, 'H-2', `Agenda "${ev.title}" akan dimulai dalam 2 hari.`);
        // H-1 days
        checkAndNotify(1, 0, 'H-1', `Besok: "${ev.title}" akan berlangsung.`);
        // H-12 hours
        checkAndNotify(0, 12, 'H-12h', `Agenda "${ev.title}" akan dimulai dalam 12 jam.`);
        // H-0 (started)
        checkAndNotify(0, 0, 'H-0', `Agenda "${ev.title}" dimulai sekarang!`);
      });
    };

    // Run check immediately and then every minute
    checkReminders();
    const interval = setInterval(checkReminders, 60 * 1000);
    return () => clearInterval(interval);
  }, [events, notified]);

  const showNotification = (title, body) => {
    // 1. Browser Notification
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/vite.svg' });
    }
    // 2. In-App Alert
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.background = 'white';
    toast.style.color = '#0f172a';
    toast.style.padding = '1rem';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
    toast.style.zIndex = '99999';
    toast.style.borderLeft = '4px solid #3b82f6';
    toast.style.display = 'flex';
    toast.style.flexDirection = 'column';
    toast.style.gap = '4px';
    toast.style.animation = 'slideUp 0.3s ease-out';
    toast.style.maxWidth = '300px';

    toast.innerHTML = `
      <strong style="font-size: 0.9rem">${title}</strong>
      <span style="font-size: 0.8rem; color: #64748b">${body}</span>
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  };

  return (
    <EventReminderContext.Provider value={{ events }}>
      {children}
    </EventReminderContext.Provider>
  );
}

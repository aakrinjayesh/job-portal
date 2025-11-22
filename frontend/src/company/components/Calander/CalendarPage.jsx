import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import { getEvents, createEvent } from "../../api/calendarApi";
import EventModal from "./EventModal";
import { message } from "antd";

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Load events from backend
  const loadEvents = async () => {
    try {
      const res = await getEvents();
      setEvents(res.data);
    } catch (err) {
      message.error("Failed to load events",err);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // When user selects a date
  const handleDateClick = (info) => {
    setSelectedDate(info.date);
    setOpenModal(true);
  };

  // Create event
  const handleCreateEvent = async (payload) => {
    try {
      await createEvent(payload);
      message.success("Event created");
      setOpenModal(false);
      loadEvents(); // refresh calendar
    } catch (err) {
      message.error("Failed to create event",err);
    }
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        height="90vh"
      />

      <EventModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleCreateEvent}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default CalendarPage;

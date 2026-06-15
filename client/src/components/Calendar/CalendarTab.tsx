import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import CustomToast from "../Toast/CustomToast";
import { Calendar, Trash2 } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import {
  doGetAllEvents,
  doGetAllTeacherClasses,
  doUpdateEvent,
  doDeleteEvent,
} from "../../api/functions";
import { useAuth } from "../../hooks/authContext";
import { formatTimeTo12Hour, formatTimeTo24Hour } from "../../utils/helpers";
import EventModal from "../Modals/EventModal";
import { SpinLoadingColored } from "../Icons/icons";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const dayMap: { [key: string]: number } = {
  Su: 0,
  M: 1,
  T: 2,
  W: 3,
  Th: 4,
  F: 5,
  Sa: 6,
};

const TeacherScheduleTab = () => {
  const { currentUser, setLoading } = useAuth();
  const userId = currentUser?.uid || "";
  const [action, setAction] = useState<"add" | "edit">("add");
  const [events, setEvents] = useState<any[]>([]);
  const [personalEvents, setPersonalEvents] = useState<any[]>([]); // For personal events
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const response1 = (await doGetAllTeacherClasses(userId)) as any;
      const response2 = (await doGetAllEvents(userId)) as any;
      const allClasses = response1?.classes || [];
      const allEvents = response2?.events || [];

      if (
        allClasses.length === 0 &&
        allEvents.length === 0
      ) {
        toast.info(
          <CustomToast
            title="No events found"
            subtitle="You have no events scheduled for this month."
          />,
          { toastId: "no-events" }, // prevents duplicate toasts
        );
      }

      // Fetch holidays from Nager.Date API
      const currentYear = new Date().getFullYear();
      const holidayRes = await fetch(
        `https://date.nager.at/api/v3/PublicHolidays/${currentYear}/PH`,
      );
      const holidayData = await holidayRes.json();
      const holidayDates = holidayData.map((h: any) => h.date);

      const holidayEvents = holidayData.map((h: any) => ({
        title: h.localName,
        start: h.date,
        allDay: true,
        color: "#ffe0e0",
      }));

      const classEvents = generateEventsForMonth(allClasses);

      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filteredClassEvents = classEvents.filter((ev) => {
        const eventDate = new Date(ev.start);
        eventDate.setHours(0, 0, 0, 0);
        // Only include events today or in the future and not on holidays
        return (
          eventDate >= today && !holidayDates.includes(ev.start.slice(0, 10))
        );
      });

      const validEvents: any[] = [];
      for (const ev of allEvents) {
        const eventDate = new Date(`${ev.selectedDate} ${ev.time || "00:00"}`);
        eventDate.setHours(0, 0, 0, 0);
        if (eventDate >= today) {
          validEvents.push(ev);
        } else {
          const response = (await doDeleteEvent(userId, ev.id)) as any;
          if (response?.success) {
            return;
          }
        }
      }

      const customEvents = validEvents.map((ev: any) => {
        // Combine selectedDate and time to ISO string
        const startDate = new Date(`${ev.selectedDate} ${ev.time}`);
        return {
          title: ev.eventname,
          start: startDate.toISOString(),
          allDay: !ev.time,
          extendedProps: {
            id: ev.id,
            description: ev.eventdescription,
            time: ev.time,
            createdAt: ev.createdAt,
            updatedAt: ev.updatedAt,
            isClassEvent: false,
          },
        };
      });

      setPersonalEvents(customEvents);
      setEvents([...filteredClassEvents, ...holidayEvents, ...customEvents]);

      const now = new Date();
      const upcomingEvents = filteredClassEvents
        .map((ev) => {
          const eventDate = new Date(ev.start);
          const diffMs = eventDate.getTime() - now.getTime();
          const diffMin = diffMs / (1000 * 60);
          return { ev, diffMin };
        })
        .filter(({ diffMin }) => diffMin > 0 && diffMin <= 10)
        .sort((a, b) => a.diffMin - b.diffMin); // soonest first

      if (upcomingEvents.length > 0) {
        const { ev } = upcomingEvents[0]; // only show for the soonest event
        toast.info(
          <CustomToast
            title="Upcoming Class"
            subtitle={`Your class "${ev.title}" starts in less than 10 minutes!`}
          />,
          { toastId: "upcoming-class" }, // prevents duplicate toasts
        );
      }
      setLoading(false);
    };
    fetchEvents();
  }, [currentUser, refresh]);

  // Helper: Generate events for the current month
  function generateEventsForMonth(classes: any[]) {
    const events: any[] = [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Get all days in this month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const jsDay = date.getDay(); // 0=Sun, 1=Mon, ...
      classes.forEach((cls: any) => {
        if (Array.isArray(cls.days) && cls.days.some((d: string) => dayMap[d] === jsDay)) {
          const formattedTime = formatTimeTo24Hour(cls.time);
          if (formattedTime) {
            // formattedTime is "HH:mm"
            const [hour, minute] = formattedTime.split(":").map(Number);
            date.setHours(hour, minute, 0, 0);
            events.push({
              title: cls.className,
              start: date.toISOString(),
              allDay: false,
              extendedProps: {
                description: cls.classDescription,
                time: cls.time,
                days: cls.days,
                isClassEvent: true,
              },
            });
          }
        }
      });
    }
    return events;
  }

  const handleEventDrop = async (info: any) => {
    const event = info.event;
    if (!event.extendedProps.isClassEvent) {
      setLoading(true);
      try {
        const formattedTime = formatTimeTo12Hour(
          formatTimeTo24Hour(event.extendedProps.time),
        );
        const response = (await doUpdateEvent(
          userId,
          event.extendedProps.id,
          event.start.toDateString(),
          formattedTime,
          event.title,
          event.extendedProps.description,
        )) as any;
        if (response?.success) {
          toast.success(
            <CustomToast
              title="Event updated!"
              subtitle="Event moved successfully."
            />,
          );
          setRefresh(!refresh);
        }
      } catch (error) {
        toast.error(
          <CustomToast title="Error" subtitle="Could not update event." />,
        );
        info.revert(); // Move event back to original place
      } finally {
        setLoading(false);
      }
    } else {
      toast.error(
        <CustomToast
          title="Something went wrong!"
          subtitle="This event cannot be moved. Please try again."
        />,
      );
      info.revert();
    }
  };

  const handleEventClick = (info: any) => {
    if (info.event.extendedProps.isClassEvent) {
      toast.info(
        <CustomToast
          title="Class event!"
          subtitle="To edit this class, please go to the Class tab."
        />,
      );
      return;
    }
    setAction("edit");
    setSelectedEvent(info.event);
    setSelectedDate(info.event.start.toDateString());
    setIsEventModalOpen(true);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const handleDateClick = (info: any) => {
    const clickedDate = new Date(info.date);
    clickedDate.setHours(0, 0, 0, 0);
    if (clickedDate < today) return;
    setAction("add");
    setSelectedDate(clickedDate.toDateString());
    setIsEventModalOpen(true);
  };

  const handleEventDragStart = () => {
    // isDragging = true;
  };
  const handleEventDragStop = async (info: any) => {
    const trash = document.getElementById("calendar-trash");
    if (!trash) return;
    const trashRect = trash.getBoundingClientRect();
    const mouseX = info.jsEvent.clientX;
    const mouseY = info.jsEvent.clientY;

    // Check if mouse is over the trash area
    if (
      mouseX >= trashRect.left &&
      mouseX <= trashRect.right &&
      mouseY >= trashRect.top &&
      mouseY <= trashRect.bottom
    ) {
      setIsDelete(true);
      setLoading(true);
      if (!info.event.extendedProps.isClassEvent) {
        const response = (await doDeleteEvent(
          userId,
          info.event.extendedProps.id,
        )) as any;
        if (response?.success) {
          toast.success(
            <CustomToast
              title="Event deleted!"
              subtitle="Event removed successfully."
            />,
          );
          setRefresh(!refresh);
          setIsDelete(false);
          setLoading(false);
        } else {
          toast.error(
            <CustomToast
              title="Something went wrong!"
              subtitle="This event cannot be deleted. Please try again."
            />,
          );
          setIsDelete(false);
          setLoading(false);
        }
      } else {
        toast.error(
          <CustomToast
            title="Something went wrong!"
            subtitle="Could not delete the event. Please try again."
          />,
        );
        setIsDelete(false);
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-1">
      <div className="flex w-3xs p-4 border-r-2 border-[#BDC3C7]">
        {personalEvents.length > 0 ? (
          <div className="flex flex-col w-full space-y-2 text-left">
            <h2 className="text-xl font-semibold mb-2">Personal Events</h2>
            {personalEvents.map((event, index) => (
              <div
                key={index}
                className="p-4 bg-[#e0f2f1] rounded-lg shadow-sm"
              >
                <h3 className="font-bold">{event.title}</h3>
                {event.extendedProps.time && (
                  <p className="text-sm text-gray-600">
                    {event.extendedProps.time}
                  </p>
                )}
                {event.extendedProps.description && (
                  <p className="text-xs text-gray-400">
                    {event.extendedProps.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full text-2xl mt-12 font-bold tracking-tight">
            No personal events scheduled.
          </div>
        )}
      </div>
      <div className="flex-1 space-y-4 text-left">
        <div className="sticky top-0 z-50 flex items-center p-4 space-x-2 bg-white border-b-2 border-[#BDC3C7]">
          <div className="bg-[#2C3E50] rounded-lg p-2">
            <Calendar
              className="inline"
              color="white"
              size={30}
              strokeWidth={2}
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        </div>
        <div className="flex items-center justify-between px-6">
          <p className="text-xs text-red-400">
            * Note: You can only move and delete personal events, not class
            events.
          </p>
          <p className="text-xs text-gray-500 mr-2">
            Click on a date to add a new event. Drag and drop to move
            events.
          </p>
        </div>
        <motion.button
          type="button"
          title="Delete Event"
          aria-label="Delete Event"
          id="calendar-trash"
          className="fixed top-18 right-4 size-14 z-50 bg-white cursor-pointer rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            toast.info(
              <CustomToast
                title="No event selected!"
                subtitle="Please drag an event to the trash to delete it."
              />,
            );
          }}
        >
          <span className="relative flex items-center justify-center w-full h-full">
            <Trash2 color="#ff4444" size={32} strokeWidth={2} />
            {isDelete && (
              <span className="absolute inset-0 flex items-center justify-center bg-white/1 backdrop-blur-xs rounded-full z-10">
                <SpinLoadingColored size={6}/>
              </span>
            )}
          </span>
        </motion.button>
        <OverlayScrollbarsComponent
          options={{ scrollbars: { autoHide: "leave" } }}
          className="px-6 overflow-y-scroll h-[calc(100vh-195px)]"
        >
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              listPlugin,
              interactionPlugin,
            ]}
            initialView="dayGridMonth"
            events={events}
            eventContent={renderEventContent}
            height="auto"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            dayHeaderClassNames={["bg-[#2C3E50]", "text-white"]}
            dayCellClassNames={(arg) => {
              const cellDate = new Date(arg.date);
              cellDate.setHours(0, 0, 0, 0);
              if (cellDate < today) return ["fc-day-disabled"];
              return [];
            }}
            eventAllow={(dropInfo, draggedEvent) => {
              const dropDate = new Date(dropInfo.start);
              dropDate.setHours(0, 0, 0, 0);
              if (draggedEvent?.extendedProps.isClassEvent) return false;
              return dropDate >= today;
            }}
            eventDisplay="block"
            eventClassNames={["p-2"]}
            eventColor="#e0f2f1"
            eventTextColor="black"
            selectable={true} // allow date selection
            editable={true} // allow event drag/drop
            selectMirror={true} // mirror the event while dragging
            dayMaxEvents={true} // limit number of events per day
            eventDrop={handleEventDrop}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            eventDragStart={handleEventDragStart}
            eventDragStop={handleEventDragStop}
          />
        </OverlayScrollbarsComponent>
      </div>
      {isEventModalOpen && (
        <div
          className={
            "fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center"
          }
        >
          <EventModal
            action={action}
            isOpen={isEventModalOpen}
            onClose={() => setIsEventModalOpen(!isEventModalOpen)}
            callFetchEvents={() => setRefresh(!refresh)}
            selectedEvent={selectedEvent}
            selectedDate={selectedDate}
          />
        </div>
      )}
    </div>
  );
};

// Custom event rendering (optional, best practice for details)
function renderEventContent(eventInfo: any) {
  return (
    <div>
      <b className="text-base">{eventInfo.event.title}</b>
      {eventInfo.event.extendedProps.time && (
        <div className="text-sm text-gray-600">
          {eventInfo.event.extendedProps.time}
        </div>
      )}
      {eventInfo.event.extendedProps.description && (
        <div className="text-xs text-gray-400">
          {eventInfo.event.extendedProps.description}
        </div>
      )}
    </div>
  );
}

export default TeacherScheduleTab;

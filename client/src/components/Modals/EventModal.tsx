import React, { useState } from "react";
import { toast } from "react-toastify";
import CustomToast from "../Toast/CustomToast";
import { motion } from "framer-motion";
import { Info, Clock } from "lucide-react";
import {
  formatUserDate,
  formatTimeTo12Hour,
  formatTimeTo24Hour,
} from "../../utils/helpers";
import { SpinLoadingWhite } from "../Icons/icons";
import { useAuth } from "../../hooks/authContext";
import { doCreateEvent, doUpdateEvent } from "../../api/functions";

interface EventModalProps {
  action: "add" | "edit";
  isOpen: boolean;
  onClose: () => void;
  callFetchEvents: () => void;
  selectedEvent: any; // Optional, used for editing
  selectedDate: string;
}

const EventModal = ({
  action,
  isOpen,
  onClose,
  callFetchEvents,
  selectedEvent,
  selectedDate,
}: EventModalProps) => {
  const { currentUser } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [time, setTime] = useState(
    action === "edit"
      ? formatTimeTo24Hour(selectedEvent.extendedProps?.time)
      : "",
  ); // Default to empty string for new event
  const [eventname, setEventName] = useState(
    action === "edit" ? selectedEvent?.title : "",
  ); // Default to empty string for new event
  const [eventdescription, setEventDescription] = useState(
    action === "edit" ? selectedEvent.extendedProps?.description : "",
  ); // Default to empty string for new event

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRegistering) {
      setIsRegistering(true);
      try {
        const formattedTime = formatTimeTo12Hour(time);
        const userId = currentUser?.uid || "";
        let response: any;
        {
          action === "add"
            ? (response = await doCreateEvent(
                userId,
                selectedDate,
                formattedTime,
                eventname,
                eventdescription,
              ))
            : (response = await doUpdateEvent(
                userId,
                selectedEvent.extendedProps.id,
                selectedDate,
                formattedTime,
                eventname,
                eventdescription,
              ));
        }
        if (response?.success) {
          toast.success(
            <CustomToast
              title="Congratulation!"
              subtitle={`Event ${action === "add" ? "registered" : "updated"} successfully`}
            />,
          );
          callFetchEvents();
          onClose();
        } else {
          toast.error(
            <CustomToast
              title="Something went wrong!"
              subtitle={`An error occurred while ${action === "add" ? "creating" : "updating"} an event. Please try again.`}
            />,
          );
        }
      } catch (error) {
        console.error("Error creating event:", error);
      } finally {
        setIsRegistering(false);
      }
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <motion.div
        className={`relative flex-1 max-w-md bg-white py-10 px-12 rounded-lg shadow-lg`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{
          duration: 0.3,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.4 },
        }}
      >
        <a
          className="absolute top-3 right-5 text-black text-4xl cursor-pointer"
          onClick={() => {
            onClose();
          }}
        >
          &times;
        </a>
        {/* Modal content */}
        <div className="flex items-center space-x-2 mb-4">
          <motion.div
            className="text-5xl font-bold bg-blue-400 rounded-full"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: [1, -1, 1] }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <Info size={28} color="white" />
          </motion.div>
          <div className="flex gap-2 items-center">
            Selected date:{" "}
            <h1 className="text-lg font-medium">
              {formatUserDate(selectedDate)}
            </h1>
          </div>
        </div>
        <form onSubmit={handleRegister}>
          <div className="flex text-left gap-4 justify-between items-center">
            <h3 className="text-sm text-gray-600">
              Please fill in the details to{" "}
              {action === "add" ? "register new" : "update an"} event.
            </h3>
            {/* Class Time*/}
            <div className="mt-2 mb-2 text-left relative">
              <input
                disabled={isRegistering}
                name="time"
                type="time"
                id="time"
                required={action === "add"}
                className={`w-full p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${time ? "border-[#2C3E50]" : "border-gray-300"}`}
                placeholder=" "
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              <label
                className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${time ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
                htmlFor="time"
              >
                {time ? "Select time" : ""}
              </label>
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#2C3E50] pointer-events-none">
                <Clock size={20} />
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            {/* Class Name input */}
            <div className="mt-2 mb-2 text-left relative">
              <input
                disabled={isRegistering}
                name="eventname"
                type="text"
                id="eventname"
                autoComplete="eventname"
                required={action === "add"}
                autoFocus
                minLength={1}
                maxLength={30}
                className={`w-full p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${eventname ? "border-[#2C3E50]" : "border-gray-300"}`}
                placeholder=" "
                value={eventname}
                onChange={(e) => setEventName(e.target.value)}
              />
              <label
                className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${eventname ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
                htmlFor="eventname"
              >
                Event name
              </label>
            </div>
            {/* Description */}
            <div className="mt-2 mb-2 text-left relative">
              <input
                disabled={isRegistering}
                title="Event description"
                name="Event description"
                type="text"
                id="Event description"
                autoComplete="Event description"
                required={action === "add"}
                minLength={1}
                className={`w-full p-4 border rounded-sm transition-all duration-300 focus:ring-2 focus:ring-[#2C3E50] focus:outline-none ${eventdescription ? "border-[#2C3E50]" : "border-gray-300"}`}
                placeholder=" "
                value={eventdescription}
                onChange={(e) => setEventDescription(e.target.value)}
              />
              <label
                className={`absolute text-lg font-medium left-4 top-4 text-[#2C3E50] px-1 transition-all duration-300 transform ${eventdescription ? "bg-white top-[-10px] text-[#2C3E50] text-sm" : "top-4 text-gray-500 text-base"}`}
                htmlFor="Event description"
              >
                Description
              </label>
            </div>
          </div>
          {/* Register button */}
          <button
            type="submit"
            className={`w-full bg-[#2C3E50] text-lg text-white mt-4 px-15 py-3 rounded-lg shadow-md drop-shadow-lg ${isRegistering ? "opacity-50 cursor-not-allowed" : "hover:font-medium hover:border-[#386BF6] hover:bg-[#34495e]"}`}
            disabled={isRegistering}
          >
            {isRegistering ? (
              <div className="flex items-center justify-center gap-2">
                <SpinLoadingWhite size={6}/>
                Processing...
              </div>
            ) : action === "add" ? (
              "Add event"
            ) : (
              "Update event"
            )}
          </button>
        </form>
      </motion.div>
    </>
  );
};

export default EventModal;

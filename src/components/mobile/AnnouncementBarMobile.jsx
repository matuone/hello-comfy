// AnnouncementBarMobile.jsx

import { useEffect, useState } from "react";
import "../../styles/mobile/announcementbar.css";

const MESSAGES = [
  "¡Envío gratis en compras +$190.000! 🤑",
  "10% OFF X TRANSFERENCIA 💳",
  "3x2 en remeras sólo hoy 🧸",
];

export default function AnnouncementBarMobile() {
  const [index, setIndex] = useState(0);
  const [announcementMessages, setAnnouncementMessages] = useState(MESSAGES);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch("/api/site-config/announcement-bar-messages");
        const data = await res.json();
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setAnnouncementMessages(data.messages);
        }
      } catch (err) {
        setAnnouncementMessages(MESSAGES);
      }
    }
    fetchMessages();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % announcementMessages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [announcementMessages]);

  return (
    <div className="announcementbar-mobile" aria-roledescription="carousel" aria-label="Promos Hello-Comfy">
      <span className="announcementbar-mobile__message">{announcementMessages[index]}</span>
      <div className="announcementbar-mobile__dots">
        {announcementMessages.map((_, i) => (
          <span key={i} className={i === index ? "active" : ""} />
        ))}
      </div>
    </div>
  );
}

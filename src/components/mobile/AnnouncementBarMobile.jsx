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

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="announcementbar-mobile" aria-roledescription="carousel" aria-label="Promos Hello-Comfy">
      <span className="announcementbar-mobile__message">{MESSAGES[index]}</span>
      <div className="announcementbar-mobile__dots">
        {MESSAGES.map((_, i) => (
          <span key={i} className={i === index ? "active" : ""} />
        ))}
      </div>
    </div>
  );
}

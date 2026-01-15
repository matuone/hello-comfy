import { useEffect } from "react";
import "../styles/imagemodal.css";

export default function ImageModal({ imageUrl, productName, isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="image-modal-backdrop" onClick={handleBackdropClick}>
      <div className="image-modal-content">
        <button 
          className="image-modal-close"
          onClick={onClose}
          title="Cerrar"
          aria-label="Cerrar"
        >
          ✕
        </button>
        <img 
          src={imageUrl} 
          alt={productName}
          className="image-modal-img"
        />
      </div>
    </div>
  );
}

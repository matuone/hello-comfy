import React from "react";

export default function ComfyModal({ open, title, message, onConfirm, onCancel, confirmText = "Aceptar", cancelText = "Cancelar" }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.25)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 24px #0002",
        minWidth: 320,
        maxWidth: 400,
        padding: 32,
        textAlign: "center",
        fontFamily: 'Montserrat, sans-serif',
        color: "#222"
      }}>
        {title && <h3 style={{ margin: 0, marginBottom: 12, fontWeight: 800, color: "#d94f7a", fontSize: 22 }}>{title}</h3>}
        <div style={{ marginBottom: 28, fontSize: 17 }}>{message}</div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <button
            onClick={onConfirm}
            style={{
              background: "#d94f7a",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 22px",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 2px 8px #d94f7a22"
            }}
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            style={{
              background: "#fff",
              color: "#d94f7a",
              border: "1.5px solid #d94f7a",
              borderRadius: 8,
              padding: "8px 22px",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer"
            }}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

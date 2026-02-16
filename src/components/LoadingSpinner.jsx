// ============================
// LOADING SPINNER COMPONENT
// ============================
// Componente reutilizable para mostrar un spinner mientras se carga algo

export default function LoadingSpinner({
  visible = true,
  message = "Cargando...",
  fullScreen = false
}) {
  if (!visible) return null;

  const spinnerStyle = {
    width: 40,
    height: 40,
    border: "4px solid rgba(255,255,255,0.3)",
    borderTop: "4px solid #ff7e7e",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };

  const containerStyle = fullScreen ? {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.3)",
    zIndex: 9998,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(2px)",
  } : {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 32,
  };

  return (
    <>
      <div style={containerStyle}>
        <div style={spinnerStyle} />
        {message && (
          <p style={{
            color: fullScreen ? "#fff" : "#666",
            fontSize: "0.95rem",
            fontWeight: 500,
            margin: 0,
          }}>
            {message}
          </p>
        )}
      </div>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
}

// src/components/MarketingMessage.jsx

export default function MarketingMessage({ message }) {
  // Quill convierte espacios a &nbsp; que no permiten word-wrap.
  // Los reemplazamos por espacios normales para que el texto corte dentro del contenedor.
  const cleanHtml = (message || '').replace(/&nbsp;/g, ' ');
  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
}

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta donde se guardan los componentes de tablas de talles
const SIZETABLES_DIR = path.join(__dirname, "../../src/components/sizeTables");

export async function generateSizeTableComponent(tableData) {
  try {
    const { name, displayName, sizes, measurements } = tableData;
    
    // Convertir nombre a PascalCase para el componente
    const componentName = name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");

    // Generar el código JSX
    const componentCode = `import "../../styles/product-size-tables.css";

export default function ${componentName}Table() {
  return (
    <div className="size-table">
      <h3>${displayName}</h3>
      <table>
        <thead>
          <tr>
            <th></th>${sizes.map((size) => `<th>${size}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
${measurements
  .map((m) => {
    const values = sizes.map((size) => {
      const value = m.values instanceof Map ? m.values.get(size) : m.values[size];
      return `<td>${value || "-"}</td>`;
    }).join("");
    return `          <tr><td>${m.name}</td>${values}</tr>`;
  })
  .join("\n")}
        </tbody>
      </table>
    </div>
  );
}
`;

    // Guardar el archivo
    const fileName = `${componentName}Table.jsx`;
    const filePath = path.join(SIZETABLES_DIR, fileName);

    await fs.writeFile(filePath, componentCode, "utf-8");

    return {
      success: true,
      fileName,
      componentName: `${componentName}Table`,
    };
  } catch (error) {
    console.error("Error generando componente:", error);
    throw error;
  }
}

export async function deleteSizeTableComponent(name) {
  try {
    const componentName = name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");

    const fileName = `${componentName}Table.jsx`;
    const filePath = path.join(SIZETABLES_DIR, fileName);

    await fs.unlink(filePath);

    return { success: true };
  } catch (error) {
    console.error("Error eliminando componente:", error);
    throw error;
  }
}

export async function updateSizeTableComponent(tableData) {
  try {
    // Primero eliminar el componente anterior si existe
    await deleteSizeTableComponent(tableData.name).catch(() => {});
    
    // Luego crear el nuevo
    return await generateSizeTableComponent(tableData);
  } catch (error) {
    console.error("Error actualizando componente:", error);
    throw error;
  }
}

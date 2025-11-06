// src/@types/global.d.ts
export {};

declare global {
  interface Window {
    // función que usas desde el botón de descargar
    exportFilteredDataToExcel: () => void;
    // util por si quieres limpiar filtros desde la barra
    clearAllFilters?: () => void;
  }
}

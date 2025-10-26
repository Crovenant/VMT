// Acepta importar archivos .jsx como componentes React por defecto
declare module '*.jsx' {
  import React from 'react';
  const Component: React.ComponentType<any>;
  export default Component;
}

// Declaración explícita para el import "./modules/Dashboard"
declare module './modules/Dashboard' {
  import React from 'react';
  const Component: React.ComponentType<any>;
  export default Component;
}

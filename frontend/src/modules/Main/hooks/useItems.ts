// src/modules/Main/hooks/useItems.ts

import { useEffect, useState } from 'react';
import type { Item } from '../types/item';

export default function useItems(refreshKey: number) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/risk-data/')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: Item[]) => {
        const now = new Date();

        const updatedItems = data.map(item => {
          const createdDate = new Date(item.fechaCreacion);
          const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

          let followUp = false;
          let soonDue = false;

          switch (item.prioridad) {
            case 'Crítico':
              followUp = diffDays >= 30;
              soonDue = diffDays >= 23 && diffDays < 30;
              break;
            case 'Alto':
              followUp = diffDays >= 90;
              soonDue = diffDays >= 83 && diffDays < 90;
              break;
            case 'Medio':
            case 'Bajo':
              followUp = diffDays >= 365;
              soonDue = diffDays >= 358 && diffDays < 365;
              break;
          }

          return { ...item, followUp, soonDue };
        });

        setItems(updatedItems);
      })
      .catch(error => {
        console.error('Error fetching items:', error);
      });
  }, [refreshKey]);

  return { items };
}

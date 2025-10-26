// modules/Main/hooks/useFocusItems.ts
import useItems from './useItems';

export default function useFocusItems(refreshKey: number) {
  const { items } = useItems(refreshKey);

  const now = new Date();
  const processedItems = items.map(item => {
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

  const followUpCount = processedItems.filter(row => row.followUp).length;
  const soonDueCount = processedItems.filter(row => row.soonDue).length;

  return { followUpCount, soonDueCount };
}
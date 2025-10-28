import Title from '../Title';
import FocusPanel from './FocusPanel';
import useItems from '../../../../Shared/hooks/useItems';

export default function FocusWrapper({
  refreshKey,
  onFilterByFlag,
}: {
  refreshKey: number;
  onFilterByFlag: (flag: 'followUp' | 'soonDue') => void;
}) {
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

  const followUpCount = processedItems.filter(i => i.followUp).length;
  const soonDueCount = processedItems.filter(i => i.soonDue).length;

  return (
    <>
      <Title>Focus Items</Title>
      <FocusPanel
        followUpCount={followUpCount}
        soonDueCount={soonDueCount}
        onFilterByFlag={onFilterByFlag}
      />
    </>
  );
}
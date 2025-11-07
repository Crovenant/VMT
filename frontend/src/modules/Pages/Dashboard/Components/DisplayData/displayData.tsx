// src/modules/Pages/Dashboard/Components/DisplayData/DisplayData.tsx
import DisplayWrapper from './DisplayWrapper';

export default function DisplayData(props: {
  refreshKey: number;
  priorityFilter?: string | null;
  selectedItemId?: string | null;
  customFlagFilter?: 'followUp' | 'soonDue' | null;
}) {
  return <DisplayWrapper {...props} />;
}
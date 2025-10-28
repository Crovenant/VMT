import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import type { Item } from '../../../../Types/item';

export default function ListTable({ items }: { items: Item[] }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Nombre</TableCell>
          <TableCell>Prioridad</TableCell>
          <TableCell>Fecha de creación</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map(item => (
          <TableRow key={item.id}>
            <TableCell>{item.id}</TableCell>
            <TableCell>{item.nombre}</TableCell>
            <TableCell>{item.prioridad}</TableCell>
            <TableCell>{item.fechaCreacion}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
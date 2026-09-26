/** Move o item de `fromIndex` para `toIndex`, sem alterar o array original. */
export function reorderArray<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

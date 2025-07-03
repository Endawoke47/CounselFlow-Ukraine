export const dataToOptions = <T extends { id: any; name: string }>(
  data: T[]
): { value: T['id']; label: string }[] => {
  if (!data) {
    return [];
  }

  return data.map((option) => ({
    value: option.id,
    label: option.name,
  }));
};

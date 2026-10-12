export type Person = { name: string; signature: string };

export type FormData = {
  checks: Record<string, boolean>;
  readings: Record<string, string>;
  choices: Record<string, string>;
  comments: Record<string, string>;
  completedBy: Person;
  manager: Person;
};

export const emptyForm = (): FormData => ({
  checks: {},
  readings: {},
  choices: {},
  comments: {},
  completedBy: { name: "", signature: "" },
  manager: { name: "", signature: "" },
});

export const todayISO = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return y ? `${d}/${m}/${y}` : "";
};

export default function formatPhone(str: string) {
  if (str.length < 8) return str;

  const p = str.replace("+852", "");
  return `${p.substring(0, 4)} ${p.substring(4, 8)}`;
}

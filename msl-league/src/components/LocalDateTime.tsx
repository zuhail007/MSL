"use client";

type LocalDateTimeProps = {
  value?: string | Date | null;
  fallback?: string;
};

export default function LocalDateTime({
  value,
  fallback = "TBD",
}: LocalDateTimeProps) {
  if (!value) return <>{fallback}</>;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return <>{fallback}</>;

  return <>{date.toLocaleString()}</>;
}
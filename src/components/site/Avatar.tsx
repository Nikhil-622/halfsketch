export function Avatar({ email, photoURL, className = "size-8 text-xs" }: { email: string; photoURL?: string | null; className?: string }) {
  const initial = (email.trim()[0] ?? "?").toUpperCase();
  if (photoURL) {
    return <img src={photoURL} alt="" referrerPolicy="no-referrer" className={`rounded-full object-cover ${className}`} />;
  }
  return (
    <span className={`grid place-items-center rounded-full bg-paper font-medium ${className}`} aria-hidden>
      {initial}
    </span>
  );
}

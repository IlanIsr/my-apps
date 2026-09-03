export function Button(props: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className="self-start rounded-lg bg-foreground px-4 py-2 font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-40"
    />
  );
}

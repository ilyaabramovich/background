export default function ActionButton(props: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className="inline-flex cursor-pointer items-center justify-center rounded-md border border-current px-3 font-semibold whitespace-nowrap disabled:cursor-default disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2"
      {...props}
    />
  );
}

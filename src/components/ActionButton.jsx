export default function ActionButton(props) {
  return (
    <button
      type="button"
      className="cursor-pointer rounded-md border border-current px-3 py-1 disabled:cursor-default disabled:opacity-40"
      {...props}
    />
  );
}

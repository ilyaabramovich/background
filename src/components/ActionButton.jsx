export default function ActionButton(props) {
  return (
    <button
      type="button"
      className="cursor-pointer font-semibold rounded-md border border-current px-4 py-2 disabled:cursor-default disabled:opacity-40 focus:outline-2 focus:outline-offset-2"
      {...props}
    />
  );
}

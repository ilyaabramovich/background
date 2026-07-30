import { memo } from "react";

export default memo(function ActionButton(props) {
  return (
    <button
      type="button"
      className="inline-flex h-[var(--actions-h)] cursor-pointer items-center justify-center rounded-md border border-current px-4 font-semibold disabled:cursor-default disabled:opacity-40 focus:outline-2 focus:outline-offset-2"
      {...props}
    />
  );
});

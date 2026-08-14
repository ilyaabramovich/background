type ActionButtonProps = React.PropsWithChildren<{
  onClick: () => void;
  disabled?: boolean;
}>;

export default function ActionButton({ children, onClick, disabled }: ActionButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex cursor-pointer items-center justify-center rounded-md border border-current px-4 py-2 font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-default disabled:opacity-40"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

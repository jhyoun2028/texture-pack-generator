interface Props {
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  label?: string;
}

export function DownloadButton({ onClick, disabled, busy, label = "Download override pack" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      {busy ? "Generating…" : label}
    </button>
  );
}

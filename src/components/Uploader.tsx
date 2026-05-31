import { useId, useRef, useState } from "react";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const ACCEPT = ".zip,.jar,application/zip,application/java-archive";

export function Uploader({ onFile, disabled }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setFilename(file.name);
    onFile(file);
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    handleFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div>
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-6 text-center text-sm transition ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 bg-white hover:border-slate-400"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <span className="font-medium text-slate-700">
          Drop your vanilla <code>.zip</code> or <code>.jar</code> here
        </span>
        <span className="mt-1 text-xs text-slate-500">or click to choose a file</span>
        {filename && (
          <span className="mt-3 rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
            {filename}
          </span>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={ACCEPT}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>
    </div>
  );
}

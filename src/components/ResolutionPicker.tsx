import type { Resolution } from "../types";

const OPTIONS: { value: Resolution; upscaled: boolean }[] = [
  { value: 16, upscaled: false },
  { value: 32, upscaled: true },
  { value: 64, upscaled: true },
  { value: 128, upscaled: true },
];

interface Props {
  value: Resolution;
  onChange: (r: Resolution) => void;
}

export function ResolutionPicker({ value, onChange }: Props) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-700">Resolution</legend>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => {
          const selected = opt.value === value;
          return (
            <label
              key={opt.value}
              className={`flex cursor-pointer flex-col items-start rounded-md border px-3 py-2 text-sm transition focus-within:ring-2 focus-within:ring-blue-500 ${
                selected
                  ? "border-blue-600 bg-blue-50 text-blue-900"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              <input
                type="radio"
                name="resolution"
                value={opt.value}
                checked={selected}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <span className="font-semibold">{opt.value}×</span>
              <span className="text-xs text-slate-500">
                {opt.upscaled ? "upscaled" : "native detail"}
              </span>
            </label>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        16× is the only real-detail tier. 32/64/128 are nearest-neighbor upscales of the same art.
      </p>
    </fieldset>
  );
}

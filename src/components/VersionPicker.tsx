import type { GameVersion } from "../types";

const OPTIONS: { value: GameVersion; label: string; note: string }[] = [
  { value: "1.8.9", label: "1.8.9", note: "legacy PvP" },
  { value: "26.x", label: "26.x", note: "current (26.1.2)" },
];

interface Props {
  value: GameVersion;
  onChange: (v: GameVersion) => void;
}

export function VersionPicker({ value, onChange }: Props) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-700">Minecraft version</legend>
      <div className="flex gap-2">
        {OPTIONS.map((opt) => {
          const selected = opt.value === value;
          return (
            <label
              key={opt.value}
              className={`flex cursor-pointer flex-col rounded-md border px-3 py-2 text-sm transition focus-within:ring-2 focus-within:ring-blue-500 ${
                selected
                  ? "border-blue-600 bg-blue-50 text-blue-900"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              <input
                type="radio"
                name="version"
                value={opt.value}
                checked={selected}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <span className="font-semibold">{opt.label}</span>
              <span className="text-xs text-slate-500">{opt.note}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

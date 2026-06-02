import { useCallback, useState } from "react";
import { DownloadButton } from "./components/DownloadButton";
import { Footer } from "./components/Footer";
import { ResolutionPicker } from "./components/ResolutionPicker";
import { Uploader } from "./components/Uploader";
import { VersionPicker } from "./components/VersionPicker";
import { readPack } from "./lib/packReader";
import { suggestFilename, writeOverridePack } from "./lib/packWriter";
import type { GameVersion, PackIndex, Resolution } from "./types";

type Status =
  | { kind: "idle" }
  | { kind: "parsing" }
  | { kind: "ready"; index: PackIndex }
  | { kind: "generating" }
  | { kind: "error"; message: string };

export default function App() {
  const [version, setVersion] = useState<GameVersion>("1.8.9");
  const [resolution, setResolution] = useState<Resolution>(16);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const onFile = useCallback(async (file: File) => {
    setStatus({ kind: "parsing" });
    try {
      const index = await readPack(file);
      setStatus({ kind: "ready", index });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to read pack.";
      setStatus({ kind: "error", message });
    }
  }, []);

  const onDownload = useCallback(async () => {
    if (status.kind !== "ready") return;
    const { index } = status;
    setStatus({ kind: "generating" });
    try {
      const blob = await writeOverridePack({ index, version });
      triggerDownload(blob, suggestFilename(version));
      setStatus({ kind: "ready", index });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate pack.";
      setStatus({ kind: "error", message });
    }
  }, [status, version]);

  const ready = status.kind === "ready";
  const busy = status.kind === "parsing" || status.kind === "generating";

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Texture Pack Generator</h1>
          <p className="mt-1 text-sm text-slate-600">
            Upload a vanilla Java Edition pack, pick a target version, and we&apos;ll build an
            override-only pack ready to drop into <code>resourcepacks/</code>.
          </p>
        </header>

        <div className="space-y-6">
          <VersionPicker value={version} onChange={setVersion} />
          <ResolutionPicker value={resolution} onChange={setResolution} />
          <Uploader onFile={onFile} disabled={busy} />

          <StatusLine status={status} />

          <DownloadButton onClick={onDownload} disabled={!ready} busy={status.kind === "generating"} />

          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
            M1: textures pass through unchanged. Loaded pack → override pack with correct{" "}
            <code>pack.mcmeta</code> for the selected version. Transforms arrive in M2.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatusLine({ status }: { status: Status }) {
  switch (status.kind) {
    case "idle":
      return <p className="text-sm text-slate-500">No file loaded yet.</p>;
    case "parsing":
      return <p className="text-sm text-slate-600">Reading pack…</p>;
    case "ready":
      return (
        <p className="text-sm text-slate-600">
          Indexed{" "}
          <span className="font-medium text-slate-800">{status.index.entries.size}</span> texture
          entr{status.index.entries.size === 1 ? "y" : "ies"} from{" "}
          <span className="font-medium text-slate-800">{status.index.sourceName}</span>.
        </p>
      );
    case "generating":
      return <p className="text-sm text-slate-600">Generating override pack…</p>;
    case "error":
      return (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {status.message}
        </p>
      );
  }
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

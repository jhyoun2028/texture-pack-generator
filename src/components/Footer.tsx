export function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-xs text-slate-600">
      <div className="mx-auto max-w-3xl px-4">
        <p className="font-semibold uppercase tracking-wide text-slate-700">
          Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.
        </p>
        <p className="mt-2">
          For personal, non-commercial use only. The base pack you upload is processed entirely in
          your browser and never sent to a server. See{" "}
          <a
            href="https://www.minecraft.net/en-us/usage-guidelines"
            target="_blank"
            rel="noreferrer noopener"
            className="text-blue-700 underline"
          >
            Mojang&apos;s Usage Guidelines
          </a>
          .
        </p>
      </div>
    </footer>
  );
}

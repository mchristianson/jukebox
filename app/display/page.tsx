import QRCode from "qrcode";
import { headers } from "next/headers";

export default async function DisplayPage() {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const joinUrl = `${protocol}://${host}/join`;
  const qr = await QRCode.toDataURL(joinUrl, { margin: 1, width: 900, color: { dark: "#1a1d20", light: "#f2e3c4" } });

  return (
    <main className="flex min-h-screen items-center justify-center px-8 py-10">
      <section className="grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_420px]">
        <div>
          <h1
            className="text-[clamp(3.5rem,9vw,5.5rem)] font-bold uppercase leading-[0.88] text-barn-500"
            style={{ fontFamily: "var(--font-anton, 'Impact', sans-serif)" }}
          >
            Barn<br />Jukebox
          </h1>
          <p
            className="mt-6 text-2xl font-semibold uppercase tracking-[0.14em] text-cream"
            style={{ fontFamily: "var(--font-oswald, sans-serif)" }}
          >
            Scan to request songs.
          </p>
          <p className="mt-3 max-w-2xl text-lg text-cream/50" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>
            Add songs, then watch your spot in the live queue.
          </p>
          <p className="mt-8 rounded-2xl border-2 border-night-400/50 bg-card px-5 py-4 text-xl font-semibold text-cream/70" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>
            {joinUrl}
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border-2 border-barn-700 shadow-lg">
          <div className="bg-barn-500 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-cream" style={{ fontFamily: "var(--font-oswald, sans-serif)" }}>
            Scan to join
          </div>
          <div className="bg-parchment p-4">
            <img src={qr} alt={`QR code for ${joinUrl}`} className="aspect-square w-full rounded-xl" />
          </div>
        </div>
      </section>
    </main>
  );
}

import QRCode from "qrcode";
import { headers } from "next/headers";

export default async function DisplayPage() {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const joinUrl = `${protocol}://${host}/join`;
  const qr = await QRCode.toDataURL(joinUrl, { margin: 1, width: 900, color: { dark: "#0d1117", light: "#ffffff" } });

  return (
    <main className="flex min-h-screen items-center justify-center bg-night px-8 py-10">
      <section className="grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_420px]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-neon">Barn Jukebox</p>
          <h1 className="mt-4 text-6xl font-black leading-none text-white sm:text-7xl">Scan to request songs.</h1>
          <p className="mt-6 max-w-2xl text-2xl font-bold text-white/60">
            Add songs, then watch your spot in the live queue.
          </p>
          <p className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-2xl font-black text-white">{joinUrl}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-5 shadow-glow">
          <img src={qr} alt={`QR code for ${joinUrl}`} className="aspect-square w-full rounded-3xl" />
        </div>
      </section>
    </main>
  );
}

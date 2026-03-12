import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-white">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-600 mb-6">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          LA Pilot - Now Live
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 leading-[1.1]">
          Get paid for<br />your influence.
        </h1>
        <p className="text-lg text-gray-500 mb-10 leading-relaxed">
          Hyper connects local restaurants with micro-creators for real campaigns, real content, and real money.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-2xl bg-black text-white px-8 py-4 text-lg font-semibold hover:bg-gray-900 active:scale-[0.98] transition-all shadow-lg shadow-black/10"
        >
          Get Started
        </Link>
        <p className="text-xs text-gray-400 mt-4">No credit card required</p>
      </div>
    </main>
  );
}

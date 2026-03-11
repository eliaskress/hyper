import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Hyper</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        The marketplace connecting local businesses with micro-influencers. Real work, real pay.
      </p>
      <Link
        href="/login"
        className="rounded-full bg-black text-white px-8 py-3 text-lg font-medium hover:bg-gray-800 transition-colors"
      >
        Get Started
      </Link>
    </main>
  );
}

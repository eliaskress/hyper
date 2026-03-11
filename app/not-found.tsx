import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-gray-600 mb-6">We couldn&apos;t find what you&apos;re looking for.</p>
      <Link href="/" className="text-blue-600 hover:underline">
        Back to home
      </Link>
    </main>
  );
}

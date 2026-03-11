import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm text-center">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">Hyper</h1>
      <p className="text-gray-500 mb-10">
        The AI-operated influence engine.
      </p>
      <div className="flex flex-col gap-3">
        <Link
          href="/influencer"
          className="group w-full rounded-2xl border-2 border-gray-100 bg-white p-6 text-left hover:border-black hover:shadow-lg transition-all duration-200 block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-lg">Creator</span>
            <span className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all duration-200 text-xl">&rarr;</span>
          </div>
          <span className="text-gray-500 text-sm leading-relaxed">
            Get matched with restaurants, create content, earn based on your influence.
          </span>
        </Link>
        <Link
          href="/brand"
          className="group w-full rounded-2xl border-2 border-gray-100 bg-white p-6 text-left hover:border-black hover:shadow-lg transition-all duration-200 block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-lg">Restaurant</span>
            <span className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all duration-200 text-xl">&rarr;</span>
          </div>
          <span className="text-gray-500 text-sm leading-relaxed">
            Submit a briefing, Hyper handles the rest — matching, scheduling, measurement, reporting.
          </span>
        </Link>
      </div>
      <p className="text-xs text-gray-400 mt-8">
        Demo mode — no sign-in needed
      </p>
    </div>
  );
}

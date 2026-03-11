export default function OnboardingPage() {
  return (
    <div className="w-full max-w-sm text-center">
      <h1 className="text-3xl font-bold mb-2">Who are you?</h1>
      <p className="text-gray-600 mb-8">Pick your role. This can&apos;t be changed later.</p>
      <div className="flex flex-col gap-4">
        <button className="rounded-xl border-2 border-gray-200 p-6 text-left hover:border-black transition-colors">
          <h2 className="font-bold text-lg">I&apos;m a Restaurant</h2>
          <p className="text-gray-600 text-sm">Submit a briefing and let Hyper run your influence engine.</p>
        </button>
        <button className="rounded-xl border-2 border-gray-200 p-6 text-left hover:border-black transition-colors">
          <h2 className="font-bold text-lg">I&apos;m a Creator</h2>
          <p className="text-gray-600 text-sm">Get matched with restaurants and earn based on your influence.</p>
        </button>
      </div>
    </div>
  );
}

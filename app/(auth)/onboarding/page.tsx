export default function OnboardingPage() {
  return (
    <div className="w-full max-w-sm text-center">
      <h1 className="text-3xl font-bold mb-2">Who are you?</h1>
      <p className="text-gray-600 mb-8">Pick your role. This can&apos;t be changed later.</p>
      <div className="flex flex-col gap-4">
        <button className="rounded-xl border-2 border-gray-200 p-6 text-left hover:border-black transition-colors">
          <h2 className="font-bold text-lg">I&apos;m a Brand</h2>
          <p className="text-gray-600 text-sm">Post campaigns and find local creators.</p>
        </button>
        <button className="rounded-xl border-2 border-gray-200 p-6 text-left hover:border-black transition-colors">
          <h2 className="font-bold text-lg">I&apos;m an Influencer</h2>
          <p className="text-gray-600 text-sm">Browse campaigns and get paid for your reach.</p>
        </button>
      </div>
    </div>
  );
}

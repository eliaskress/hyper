export default function LoginPage() {
  return (
    <div className="w-full max-w-sm text-center">
      <h1 className="text-3xl font-bold mb-2">Welcome to Hyper</h1>
      <p className="text-gray-600 mb-8">Sign in with Instagram to get started.</p>
      <button className="w-full rounded-full bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors">
        Continue with Instagram
      </button>
    </div>
  );
}

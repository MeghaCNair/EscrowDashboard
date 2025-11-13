export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fdf0f0] to-[#eef3fb]">
      <div className="text-center space-y-4">
        <div className="relative inline-flex">
          <span className="h-14 w-14 rounded-full border-4 border-[#ffebee]"></span>
          <span className="absolute inset-0 h-14 w-14 rounded-full border-4 border-t-[#d32f2f] border-r-transparent border-l-transparent border-b-transparent animate-spin"></span>
        </div>
        <div>
          <p className="text-gray-800 font-medium">Preparing your escrow insights...</p>
          <p className="text-sm text-gray-500">Connecting to Rocket Companies data services</p>
        </div>
      </div>
    </div>
  );
}


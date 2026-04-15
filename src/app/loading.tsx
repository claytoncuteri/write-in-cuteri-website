export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="bg-navy/80 py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-10 sm:h-12 w-3/4 bg-white/10 rounded" />
            <div className="h-5 w-2/3 bg-white/10 rounded" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {/* Section title */}
          <div className="space-y-3 max-w-3xl">
            <div className="h-8 w-64 bg-gray-200 rounded" />
            <div className="h-4 w-96 bg-gray-100 rounded" />
          </div>

          {/* Card skeletons */}
          <div className="grid sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-cream/50 rounded-lg p-6 border border-gray-100"
              >
                <div className="h-3 w-20 bg-gray-200 rounded mb-3" />
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-3" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-5/6 bg-gray-100 rounded" />
                </div>
                <div className="h-4 w-24 bg-gray-200 rounded mt-4" />
              </div>
            ))}
          </div>

          {/* More content skeleton */}
          <div className="space-y-3 max-w-3xl pt-8">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-100 rounded" />
            <div className="h-4 w-5/6 bg-gray-100 rounded" />
            <div className="h-4 w-4/6 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

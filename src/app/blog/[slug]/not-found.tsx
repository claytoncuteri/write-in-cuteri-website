import Link from "next/link";

export default function BlogNotFound() {
  return (
    <section className="bg-cream py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold text-charcoal font-serif">
          Post not found
        </h1>
        <p className="mt-4 text-charcoal/70">
          The post you&rsquo;re looking for moved or never existed.
        </p>
        <div className="mt-6">
          <Link
            href="/blog"
            className="inline-block px-5 py-2.5 rounded-lg bg-navy text-white font-semibold hover:bg-navy-dark transition-colors"
          >
            All blog posts
          </Link>
        </div>
      </div>
    </section>
  );
}

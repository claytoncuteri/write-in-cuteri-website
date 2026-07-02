// Bottom-of-post block: share buttons, related posts, newsletter +
// donate CTAs, and the FEC auto-disclosure. All published posts
// render this; the site footer below adds the global FEC disclaimer,
// but having a post-scoped one too means if someone screenshots the
// post body alone the legal text travels with it.

import Link from "next/link";
import { Heart } from "lucide-react";
import type { BlogPost } from "@/lib/db";
import { CampaignShare } from "@/components/CampaignShare";
import { BlogCard } from "./BlogCard";
import { BlogNewsletterSignup } from "./BlogNewsletterSignup";

interface Props {
  post: BlogPost;
  related: BlogPost[];
}

const SITE_ORIGIN = "https://writeincuteri.com";

export function BlogPostFooter({ post, related }: Props) {
  const postUrl = `${SITE_ORIGIN}/blog/${post.slug}`;
  const shareText = `${post.title} -- Clayton Cuteri for U.S. House of Representatives, District 1 (SC).`;

  return (
    <div className="bg-cream">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Share */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-charcoal font-serif mb-3">
            Share this post
          </h2>
          <CampaignShare shareUrl={postUrl} shareText={shareText} />
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold text-charcoal font-serif mb-4">
              More from the campaign blog
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((r) => (
                <BlogCard key={r.id} post={r} />
              ))}
            </div>
          </section>
        )}

        {/* Newsletter + donate row */}
        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-charcoal font-serif mb-3">
              Get the next one in your inbox
            </h3>
            <BlogNewsletterSignup sourcePage={`/blog/${post.slug}`} />
          </div>
          <div className="bg-navy rounded-lg p-6 flex flex-col">
            <h3 className="text-lg font-bold text-white font-serif mb-2 inline-flex items-center gap-2">
              <Heart size={18} className="text-red-accent" />
              Support the campaign
            </h3>
            <p className="text-sm text-white/80 mb-4 flex-1">
              This campaign runs on small-dollar donors, not corporate
              PACs. Every contribution funds voter education and
              outreach across SC-01.
            </p>
            <Link
              href="/donate"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-red-accent text-white font-semibold hover:bg-red-accent-dark transition-colors text-sm self-start"
            >
              Donate
            </Link>
          </div>
        </div>

        {/* Post-scoped FEC disclosure. Auto-rendered; the global
            footer below adds the full disclaimer too. */}
        <div className="mt-10 pt-6 border-t border-navy/30 text-center">
          <p className="text-xs text-charcoal/70">
            Paid for by Cuteri for Americans (FEC ID C00947259).
          </p>
        </div>
      </div>
    </div>
  );
}

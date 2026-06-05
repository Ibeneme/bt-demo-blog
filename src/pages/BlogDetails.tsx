import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Check,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../configs/supabase";
import SEO from "../components/SEO"; // Adjust file location path according to your workspace
import { Helmet } from "react-helmet-async";

interface BlogPost {
  id: number | string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  tags?: string[];
}

export default function BlogDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    async function fetchArticleDetails() {
      try {
        setLoading(true);

        // 1. Fetch current article match from Supabase
        const { data: currentArticle, error: articleError } = await supabase
          .from("articles")
          .select("*")
          .eq("slug", slug)
          .single();

        if (articleError) throw articleError;

        if (currentArticle) {
          // Parse readTime dynamically from content markup string
          const words =
            currentArticle.content?.replace(/<[^>]*>/g, "").split(/\s+/)
              .length || 0;
          const computedReadTime =
            Math.max(1, Math.ceil(words / 200)) + " min read";

          const formattedDate = currentArticle.created_at
            ? new Date(currentArticle.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Recent";

          const loadedPost: BlogPost = {
            id: currentArticle.id,
            slug: currentArticle.slug,
            title: currentArticle.title,
            excerpt: currentArticle.excerpt,
            content: currentArticle.content,
            category: currentArticle.category || "Corporate Law",
            date: formattedDate,
            readTime: computedReadTime,
            image:
              currentArticle.image_url ||
              "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
            tags: currentArticle.tags || [],
          };

          setPost(loadedPost);

          // 2. Fetch alternative database items for Related Articles sidebar feed layout row
          const { data: siblingArticles, error: siblingError } = await supabase
            .from("articles")
            .select("*")
            .neq("id", currentArticle.id)
            .limit(6);

          if (siblingError) throw siblingError;

          if (siblingArticles) {
            const formattedSiblings: BlogPost[] = siblingArticles.map(
              (article: any) => {
                const sWords =
                  article.content?.replace(/<[^>]*>/g, "").split(/\s+/)
                    .length || 0;
                const sReadTime =
                  Math.max(1, Math.ceil(sWords / 200)) + " min read";

                return {
                  id: article.id,
                  slug: article.slug,
                  title: article.title,
                  excerpt: article.excerpt,
                  category: article.category || "Corporate Law",
                  date: article.created_at
                    ? new Date(article.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Recent",
                  readTime: sReadTime,
                  image:
                    article.image_url ||
                    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
                };
              }
            );

            // Sort sibling arrays by matching category priority
            const sortedSiblings = formattedSiblings
              .sort(
                (a, b) =>
                  (b.category === loadedPost.category ? 1 : 0) -
                  (a.category === loadedPost.category ? 1 : 0)
              )
              .slice(0, 3);

            setRelatedPosts(sortedSiblings);
          }
        }
      } catch (err) {
        console.error(
          "Error retrieving Supabase article data detail rows:",
          err
        );
        setPost(null);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchArticleDetails();
    }
  }, [slug]);

  const handleShare = async () => {
    if (!post) return;

    const shareData = {
      title: post.title,
      text: post.excerpt,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F7F4] font-['Rethink_Sans'] gap-3 text-gray-500">
        <Loader2 className="animate-spin text-[#4F2A7E]" size={40} />
        <span>Loading legal article context...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F7F4] gap-6 font-['Rethink_Sans']">
        <h1 className="text-4xl font-bold text-[#4F2A7E]">Article Not Found</h1>
        <Link
          to="/"
          className="text-[#D4AF37] hover:underline flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to All Articles
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F7F4] min-h-screen font-['Rethink_Sans']">
      {/* Dynamic Page Header Data Injections */}
      <SEO title={post.title} description={post.excerpt} image={post.image} />

      <Helmet>
        <title>{post.title} | Blessing Attorney</title>
        <meta name="description" content={post.excerpt} />
        <link
          rel="canonical"
          href={`https://bt-demo-blog.vercel.app/blog/${post.slug}`}
        />

        {/* Open Graph Tags for Social Media */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta
          property="og:url"
          content={`https://bt-demo-blog.vercel.app/blog/${post.slug}`}
        />
        <meta property="og:image" content={post.image} />
      </Helmet>

      {/* ✅ GLOBAL STYLES FOR BLOG CONTENT */}
      <style>{`
        .blog-content h2 {
          font-size: 2.2rem;
          font-weight: 800;
          color: #4F2A7E;
          margin-top: 3rem;
          margin-bottom: 1rem;
          padding-left: 1rem;
          border-left: 4px solid #D4AF37;
        }

        .blog-content p {
          line-height: 2.2;
          margin-bottom: 1.825rem;
          font-size: 1.125rem;
          color: #374151;
        }

        /* DROP CAP ONLY FIRST PARAGRAPH */
        .blog-content p:first-of-type::first-letter {
          float: left;
          font-size: 5rem;
          font-weight: 800;
          line-height: 0.75;
          margin-right: 0.75rem;
          color: #4F2A7E;
          font-family: Georgia, serif;
        }
      `}</style>

      {/* Hero */}
      <section className="relative h-[75vh] overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 h-full flex flex-col justify-end pb-20 text-white">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to All Articles
          </Link>

          <span className="inline-block mb-6 px-6 py-2.5 rounded-full bg-[#D4AF37] text-[#4F2A7E] font-bold text-sm w-fit">
            {post.category}
          </span>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05]">
            {post.title}
          </h1>

          <div className="flex gap-8 mt-10 text-white/90">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article */}
      <main className="max-w-5xl mx-auto px-6 -mt-12 relative z-20">
        <motion.article
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 md:p-16 prose prose-lg max-w-none prose-headings:text-[#4F2A7E] prose-a:text-[#4F2A7E] prose-strong:text-[#4F2A7E] shadow-sm"
        >
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-10 not-prose">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#4F2A7E]/5 text-[#4F2A7E] px-4 py-2 rounded-2xl text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="flex items-center gap-4 mb-10 not-prose">
            <span className="text-sm uppercase text-gray-500">
              {copied ? "Link Copied!" : "Share Article"}
            </span>
            <button
              onClick={handleShare}
              className={`p-3 rounded-2xl transition-colors ${
                copied ? "bg-green-50 text-green-600" : "hover:bg-gray-100"
              }`}
            >
              {copied ? <Check size={20} /> : <Share2 size={20} />}
            </button>
          </div>

          {/* CONTENT WRAPPER */}
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{
              __html: post.content || `<p>${post.excerpt}</p>`,
            }}
          />
        </motion.article>
      </main>

      {/* Related */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-[#4F2A7E] mb-12">
          Continue Reading
        </h2>

        {relatedPosts.length === 0 ? (
          <p className="text-gray-500">
            No other related legal insight updates recorded yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {relatedPosts.map((related) => (
              <Link
                key={related.id}
                to={`/blog/${related.slug}`}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col h-full group"
              >
                <div className="h-60 overflow-hidden">
                  <img
                    src={related.image}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={related.title}
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-bold text-[#4F2A7E] line-clamp-2 text-lg group-hover:text-[#3A1F5E] transition-colors">
                    {related.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-3 flex-grow">
                    {related.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

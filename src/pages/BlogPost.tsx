import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Clock,
  Loader2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import blogData from "../data/blogPosts.json"; // Retained solely for sidebar categories layout stability
import { supabase } from "../configs/supabase";

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
  author?: string;
  featured?: boolean;
  tags?: string[];
}

interface BlogCardProps extends BlogPost {
  onInitiateDelete: (id: number | string, title: string) => void;
  isDeleting: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({
  id,
  slug,
  title,
  excerpt,
  date,
  readTime,
  category,
  image,
  onInitiateDelete,
  isDeleting,
}) => (
  <motion.div
    whileHover={{ y: -10 }}
    layout
    className="group bg-white border border-gray-100 rounded-3xl overflow-hidden transition-all duration-700 font-['Rethink_Sans'] relative"
  >
    <div className="h-56 relative">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      <div className="absolute top-6 right-6 bg-white/95 text-[#4F2A7E] text-xs font-bold px-4 py-1.5 rounded-2xl">
        {category}
      </div>

      {/* Delete Button Option */}
      <button
        onClick={() => onInitiateDelete(id, title)}
        disabled={isDeleting}
        className="absolute bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-colors z-10 disabled:opacity-50"
        title="Delete Article"
      >
        {isDeleting ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Trash2 size={18} />
        )}
      </button>
    </div>

    <div className="p-10">
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-5">
        <div className="flex items-center gap-1.5">
          <Calendar size={16} />
          <span>{date}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock size={16} />
          <span>{readTime}</span>
        </div>
      </div>

      <h3 className="text-3xl font-bold text-[#4F2A7E] leading-tight mb-5 group-hover:text-[#3A1F5E] transition-colors">
        {title}
      </h3>

      <p className="text-gray-600 leading-relaxed mb-8 line-clamp-4 text-[17px]">
        {excerpt}
      </p>

      <Link
        to={`/blog/${slug}`}
        className="inline-flex items-center gap-3 font-semibold text-[#4F2A7E] hover:text-[#D4AF37] transition-all group-hover:gap-4 text-lg"
      >
        Read Full Article
        <ArrowRight
          size={22}
          className="transition-transform group-hover:translate-x-1"
        />
      </Link>
    </div>
  </motion.div>
);

export default function BlessingAttorneyBlog() {
  const { featuredArticle, practiceAreas } = blogData;
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loadingSupabase, setLoadingSupabase] = useState(true);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  // Custom Confirmation Modal Context States
  const [modalOpen, setModalOpen] = useState(false);
  const [targetId, setTargetId] = useState<number | string | null>(null);
  const [targetTitle, setTargetTitle] = useState("");

  // Core Function to Fetch Data exclusively from Supabase
  const fetchSupabaseArticles = async () => {
    try {
      setLoadingSupabase(true);
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedSupabasePosts: BlogPost[] = data.map((article: any) => {
          const words =
            article.content?.replace(/<[^>]*>/g, "").split(/\s+/).length || 0;
          const computedReadTime =
            Math.max(1, Math.ceil(words / 200)) + " min read";

          const formattedDate = article.created_at
            ? new Date(article.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Recent";

          return {
            id: article.id,
            slug: article.slug,
            title: article.title,
            excerpt: article.excerpt,
            content: article.content,
            category: article.category || "Corporate Law",
            date: formattedDate,
            readTime: computedReadTime,
            image:
              article.image_url ||
              "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
          };
        });

        setAllPosts(formattedSupabasePosts);
      }
    } catch (err) {
      console.error("Error pulling database articles:", err);
    } finally {
      setLoadingSupabase(false);
    }
  };

  // Open the custom confirmation modal
  const handleInitiateDelete = (id: number | string, title: string) => {
    setTargetId(id);
    setTargetTitle(title);
    setModalOpen(true);
  };

  // Execute actual database removal
  const handleConfirmDelete = async () => {
    if (!targetId) return;

    const idToDelete = targetId;
    setModalOpen(false); // Close Modal immediately
    setDeletingId(idToDelete);

    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", idToDelete);

      if (error) throw error;

      setAllPosts((prev) => prev.filter((post) => post.id !== idToDelete));
    } catch (err: any) {
      console.error("Failed to delete records:", err.message);
      alert("Could not remove article: " + err.message);
    } finally {
      setDeletingId(null);
      setTargetId(null);
      setTargetTitle("");
    }
  };

  useEffect(() => {
    fetchSupabaseArticles();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F7F4] font-['Rethink_Sans'] relative">
      {/* Hero */}
      <div className="bg-[#4F2A7E] pt-56 text-white py-32 relative overflow-hidden">
        <div className="px-8 md:px-16 max-w-5xl">
          <span className="inline-block px-4 py-2 bg-[#D4AF3725] text-[#D4AF37] text-sm font-bold tracking-[0.125em] rounded-3xl mb-8">
            {featuredArticle.tag}
          </span>

          <h2 className="text-6xl md:text-7xl font-bold leading-[1.05] tracking-tighter max-w-4xl">
            {featuredArticle.title}
          </h2>

          <p className="mt-8 text-xl text-white/80 max-w-2xl">
            {featuredArticle.excerpt}
          </p>

          <Link
            to="/create-blog-post"
            className="mt-10 inline-flex items-center gap-4 bg-white text-[#4F2A7E] px-7 py-4 rounded-full pr-3 font-bold text-lg hover:opacity-90 transition-all"
          >
            Create an Article
            <div className="bg-[#4F2A7E] p-2 rounded-full">
              <ArrowRight size={24} color="#ffffff" />
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-8 md:px-16 py-20">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Blog Grid */}
          <div className="lg:col-span-8">
            <div className="flex justify-between items-end mb-12">
              <h3 className="text-4xl font-bold text-[#4F2A7E]">
                Recent Database Articles
              </h3>

              <Link
                to="/"
                className="text-[#D4AF37] font-medium flex items-center gap-3 hover:gap-4 transition-all text-lg"
              >
                View All Articles
                <ArrowRight size={22} />
              </Link>
            </div>

            {loadingSupabase ? (
              <div className="flex items-center gap-3 text-gray-500 py-12">
                <Loader2 className="animate-spin text-[#4F2A7E]" />
                <span>Fetching Supabase contents...</span>
              </div>
            ) : allPosts.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border text-center text-gray-500">
                No articles found in your database table. Click "Create an
                Article" to post one!
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                <AnimatePresence mode="popLayout">
                  {allPosts.map((post) => (
                    <BlogCard
                      key={post.id}
                      {...post}
                      onInitiateDelete={handleInitiateDelete}
                      isDeleting={deletingId === post.id}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-12">
            {/* Most Read */}
            <div className="bg-white p-10 rounded-3xl border border-gray-100">
              <h4 className="font-bold text-2xl text-[#4F2A7E] mb-8">
                Most Read
              </h4>

              <ul className="space-y-8">
                {allPosts.slice(0, 3).map((post) => (
                  <li
                    key={post.id}
                    className="border-b border-gray-100 pb-8 last:border-none last:pb-0"
                  >
                    <Link
                      to={`/blog/${post.slug}`}
                      className="block hover:text-[#D4AF37] transition-colors group"
                    >
                      <p className="font-semibold leading-tight text-lg group-hover:text-[#4F2A7E]">
                        {post.title}
                      </p>

                      <p className="text-sm text-gray-500 mt-3">
                        {post.date} • {post.readTime}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-[#4F2A7E] to-[#2C1847] text-white p-10 rounded-3xl">
              <h4 className="font-bold text-3xl mb-4">Stay Legally Ahead</h4>

              <p className="text-white/80 mb-8">
                Monthly insights on emerging laws, compliance, and strategic
                risk management.
              </p>

              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Your professional email"
                  className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 placeholder:text-white/60 focus:outline-none focus:border-[#D4AF37]"
                />

                <button className="w-full bg-[#D4AF37] hover:bg-white text-[#4F2A7E] font-bold py-4 rounded-2xl transition-all">
                  SUBSCRIBE NOW
                </button>
              </div>
            </div>

            {/* Practice Areas */}
            <div className="bg-white p-10 rounded-3xl border border-gray-100">
              <h4 className="font-bold text-2xl text-[#4F2A7E] mb-8">
                Practice Areas
              </h4>

              <div className="flex flex-wrap gap-3">
                {practiceAreas.map((area) => (
                  <div
                    key={area}
                    className="bg-gray-50 hover:bg-[#D4AF37] hover:text-white px-5 py-3 rounded-2xl cursor-pointer transition-all duration-300 font-medium text-sm whitespace-nowrap"
                  >
                    {area}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* --- PREMIUM ANIMATED DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black"
              onClick={() => setModalOpen(false)}
            />

            {/* Modal Card content element */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white max-w-md w-full rounded-3xl p-8 relative z-10 shadow-2xl border border-gray-100 text-center"
            >
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-50 text-red-500 mb-5">
                <AlertTriangle size={28} />
              </div>

              <h3 className="text-2xl font-bold text-[#4F2A7E] tracking-tight mb-2">
                Confirm Deletion
              </h3>

              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-gray-800">
                  "{targetTitle}"
                </span>
                ? This action is irreversible.
              </p>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-md shadow-red-500/20 transition-all text-sm"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

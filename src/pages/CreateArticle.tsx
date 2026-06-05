import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Save,
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  Link2,
  Globe,
  Code,
} from "lucide-react";
import { supabase } from "../configs/supabase";

export default function CreateArticle() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Decoupling toggles for automatic generation
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [isMetaTitleCustomized, setIsMetaTitleCustomized] = useState(false);
  const [isMetaDescCustomized, setIsMetaDescCustomized] = useState(false);
  const [isSchemaCustomized, setIsSchemaCustomized] = useState(false);

  // Image handling states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ogInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [selectedOgFile, setSelectedOgFile] = useState<File | null>(null);
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "Corporate Law",
    excerpt: "",
    content: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    structuredData: "",
  });

  const editorRef = useRef<HTMLDivElement>(null);

  // Helper method to turn standard titles into URL safe routing slugs
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // Helper to generate schema blocks natively based on raw inputs
  const autoGenerateSchema = (title: string, excerpt: string, slug: string) => {
    const fallbackSlug = slug || generateSlug(title);
    return JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: title || "Untitled Article",
        description: excerpt || "No description provided.",
        url: `https://bt-demo-blog.vercel.app/blog/${fallbackSlug}`,
      },
      null,
      2
    );
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setFormData((prev) => ({ ...prev, content }));
    }
  };

  const execCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value || undefined);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleOgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedOgFile(file);
      setOgImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Article title is required";
    if (!formData.excerpt.trim()) newErrors.excerpt = "Excerpt is required";
    if (
      !formData.content.trim() ||
      formData.content === "<br>" ||
      formData.content === ""
    ) {
      newErrors.content = "Full article content is required";
    }
    if (!formData.slug.trim()) newErrors.slug = "URL slug is required";

    if (formData.structuredData.trim()) {
      try {
        JSON.parse(formData.structuredData);
      } catch (e) {
        newErrors.structuredData = "Invalid JSON schema configuration format.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImageFile = async (
    file: File,
    bucket: string
  ): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { cacheControl: "3600", upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError(null);

    try {
      // 1. Check for duplicate slug before inserting
      let finalSlug = formData.slug;
      const { data: existingArticles, error: checkError } = await supabase
        .from("articles")
        .select("slug")
        .eq("slug", finalSlug);

      if (checkError) throw checkError;

      // If duplicate found, append a 4-character random string
      if (existingArticles && existingArticles.length > 0) {
        const randomId = Math.random().toString(36).substring(2, 6);
        finalSlug = `${finalSlug}-${randomId}`;
      }

      // 2. Upload Images (using finalSlug-based naming if desired)
      let publicImageUrl = "";
      let ogImageUrl = "";
      if (selectedFile) {
        publicImageUrl = await uploadImageFile(selectedFile, "blog-covers");
      }
      if (selectedOgFile) {
        ogImageUrl = await uploadImageFile(selectedOgFile, "blog-covers");
      }

      const articleData = {
        title: formData.title,
        category: formData.category,
        excerpt: formData.excerpt,
        content: formData.content,
        slug: finalSlug, // Use the unique slug
        image_url: publicImageUrl || null,
        meta_title: formData.metaTitle || null,
        meta_description: formData.metaDescription || null,
        canonical_url: formData.canonicalUrl || null,
        og_image_url: ogImageUrl || null,
        structured_data: formData.structuredData.trim()
          ? JSON.parse(formData.structuredData)
          : null,
      };

      // 3. Insert Data
      const { error } = await supabase.from("articles").insert([articleData]);
      if (error) throw error;

      setModalType("success");
      setShowModal(true);
      // Reset form logic here...
    } catch (error: any) {
      console.error("Full Error Object:", error);
      setApiError(error.message || "Failed to save data.");
      setModalType("error");
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (modalType === "success") {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] pt-24 pb-12 sm:pt-32 sm:pb-20 px-4 sm:px-8 md:px-16 font-['Rethink_Sans'] relative">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl pt-8 sm:pt-[64px] font-bold text-[#4F2A7E] tracking-tighter mb-3 sm:mb-4">
            Create New Article
          </h1>
          <p className="text-gray-600 text-sm sm:text-lg">
            Use the editor below to craft your content with full styling
            control.
          </p>
        </header>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white p-5 sm:p-10 rounded-2xl sm:rounded-3xl border border-gray-100 space-y-6 sm:space-y-8 shadow-sm"
        >
          {/* Article Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#4F2A7E]">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Navigating M&A in 2026"
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-[#4F2A7E] outline-none transition-all text-sm sm:text-base"
                value={formData.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  const computedSlug = isSlugCustomized
                    ? formData.slug
                    : generateSlug(newTitle);

                  setFormData((prev) => ({
                    ...prev,
                    title: newTitle,
                    slug: computedSlug,
                    metaTitle: isMetaTitleCustomized
                      ? prev.metaTitle
                      : `${newTitle} | Insights`,
                    structuredData: isSchemaCustomized
                      ? prev.structuredData
                      : autoGenerateSchema(
                          newTitle,
                          prev.excerpt,
                          computedSlug
                        ),
                  }));

                  if (errors.title) setErrors({ ...errors, title: "" });
                  if (!isSlugCustomized && errors.slug)
                    setErrors({ ...errors, slug: "" });
                }}
              />
              {errors.title && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">
                  {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#4F2A7E]">
                Category
              </label>
              <select
                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-[#4F2A7E] outline-none transition-all bg-white text-sm sm:text-base"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option>Corporate Law</option>
                <option>Regulatory</option>
                <option>Compliance</option>
                <option>Intellectual Property</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#4F2A7E]">
              Excerpt (Summary) <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              placeholder="A brief summary for the blog feed..."
              className="w-full px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-[#4F2A7E] outline-none transition-all h-24 text-sm sm:text-base"
              value={formData.excerpt}
              onChange={(e) => {
                const newExcerpt = e.target.value;
                // Safely slice the description down to an ideal 155 character count layout
                const formattedDesc =
                  newExcerpt.length > 155
                    ? `${newExcerpt.slice(0, 152)}...`
                    : newExcerpt;

                setFormData((prev) => ({
                  ...prev,
                  excerpt: newExcerpt,
                  metaDescription: isMetaDescCustomized
                    ? prev.metaDescription
                    : formattedDesc,
                  structuredData: isSchemaCustomized
                    ? prev.structuredData
                    : autoGenerateSchema(prev.title, newExcerpt, prev.slug),
                }));
                if (errors.excerpt) setErrors({ ...errors, excerpt: "" });
              }}
            />
            {errors.excerpt && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.excerpt}
              </p>
            )}
          </div>

          {/* Editor Area */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#4F2A7E]">
              Full Article Content <span className="text-red-500">*</span>
            </label>

            {/* Toolbar */}
            <div className="bg-[#4F2A7E] text-white px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2 border-b rounded-t-xl sm:rounded-t-2xl">
              <div className="flex items-center gap-2 mr-2 sm:mr-4">
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white rounded flex items-center justify-center shrink-0">
                  <span className="text-[#4F2A7E] text-base sm:text-xl font-bold">
                    B
                  </span>
                </div>
                <span className="font-semibold text-xs sm:text-sm tracking-wide whitespace-nowrap">
                  Blessing Attorney Editor
                </span>
              </div>

              <div className="flex items-center gap-0.5 sm:gap-1 border-r border-white/20 pr-2 sm:pr-4">
                <button
                  type="button"
                  onClick={() => execCommand("bold")}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded hover:bg-white/10 text-sm font-bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => execCommand("italic")}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded hover:bg-white/10 text-sm italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => execCommand("underline")}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded hover:bg-white/10 text-sm underline"
                >
                  U
                </button>
              </div>

              <div className="flex items-center gap-0.5 sm:gap-1 sm:border-r border-white/20 sm:pr-4">
                <button
                  type="button"
                  onClick={() => execCommand("justifyLeft")}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded hover:bg-white/10"
                >
                  ↤
                </button>
                <button
                  type="button"
                  onClick={() => execCommand("justifyCenter")}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded hover:bg-white/10"
                >
                  ↔
                </button>
                <button
                  type="button"
                  onClick={() => execCommand("justifyRight")}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded hover:bg-white/10"
                >
                  ↦
                </button>
              </div>

              <button
                type="button"
                onClick={() => execCommand("undo")}
                className="ml-auto px-3 sm:px-4 py-1 text-xs sm:text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                Undo
              </button>
            </div>

            <div
              ref={editorRef}
              contentEditable="true"
              onInput={handleEditorInput}
              className="min-h-[350px] sm:min-h-[500px] p-4 sm:p-12 outline-none text-base sm:text-[17px] leading-relaxed text-gray-800 border border-gray-200 rounded-b-xl sm:rounded-b-2xl focus:border-[#4F2A7E]"
              style={{ fontFamily: "Calibri, Arial, sans-serif" }}
            />

            {errors.content && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.content}
              </p>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Advanced SEO Architecture Section */}
          <div className="space-y-6 bg-gray-50/50 p-4 sm:p-6 rounded-2xl border border-gray-100">
            <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-[#4F2A7E]">
              <Search size={20} /> Advanced SEO Engine Controls
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Meta Title Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                  SEO Meta Title
                </label>
                <input
                  type="text"
                  placeholder="Custom <title> tag text..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4F2A7E] bg-white outline-none transition-all text-sm"
                  value={formData.metaTitle}
                  onChange={(e) => {
                    setIsMetaTitleCustomized(e.target.value.trim() !== "");
                    setFormData({ ...formData, metaTitle: e.target.value });
                  }}
                />
              </div>

              {/* URL Routing Slug Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#4F2A7E]">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. your-article-url"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4F2A7E] bg-white outline-none transition-all text-sm"
                  value={formData.slug}
                  onChange={(e) => {
                    const manualSlug = e.target.value;
                    const customized = manualSlug.trim() !== "";
                    setIsSlugCustomized(customized);

                    setFormData((prev) => ({
                      ...prev,
                      slug: manualSlug,
                      structuredData: isSchemaCustomized
                        ? prev.structuredData
                        : autoGenerateSchema(
                            prev.title,
                            prev.excerpt,
                            manualSlug
                          ),
                    }));
                    if (errors.slug) setErrors({ ...errors, slug: "" });
                  }}
                  onBlur={() => {
                    setFormData((prev) => {
                      const finalSlug = generateSlug(prev.slug);
                      return {
                        ...prev,
                        slug: finalSlug,
                        structuredData: isSchemaCustomized
                          ? prev.structuredData
                          : autoGenerateSchema(
                              prev.title,
                              prev.excerpt,
                              finalSlug
                            ),
                      };
                    });
                  }}
                />
                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">{errors.slug}</p>
                )}
              </div>
            </div>

            {/* Meta Description Textarea */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Meta Description
              </label>
              <textarea
                maxLength={160}
                placeholder="Recommended maximum structure length: 160 characters..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4F2A7E] bg-white outline-none transition-all h-20 text-sm"
                value={formData.metaDescription}
                onChange={(e) => {
                  setIsMetaDescCustomized(e.target.value.trim() !== "");
                  setFormData({ ...formData, metaDescription: e.target.value });
                }}
              />
            </div>

            {/* Canonical Link Field */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <Link2 size={16} className="text-[#4F2A7E]" /> Canonical URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/original-source-link"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4F2A7E] bg-white outline-none transition-all text-sm"
                value={formData.canonicalUrl}
                onChange={(e) =>
                  setFormData({ ...formData, canonicalUrl: e.target.value })
                }
              />
            </div>

            {/* Open Graph Social Sharing Cover Upload */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <Globe size={16} className="text-[#4F2A7E]" /> Open Graph Social
                Cover Image (og:image)
              </label>
              <input
                type="file"
                ref={ogInputRef}
                onChange={handleOgFileChange}
                accept="image/*"
                className="hidden"
              />
              {ogImagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 h-32 w-full max-w-md bg-white">
                  <img
                    src={ogImagePreview}
                    alt="OG Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => ogInputRef.current?.click()}
                      className="bg-white/90 text-xs px-3 py-1.5 rounded-lg font-bold text-[#4F2A7E] hover:bg-white"
                    >
                      Swap OG Image
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => ogInputRef.current?.click()}
                  className="border border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-[#4F2A7E] bg-white transition-all"
                >
                  <p className="text-xs font-semibold text-gray-500">
                    Optional: Upload custom 1200x630 social card layout image.
                    (Leaves default article cover if empty)
                  </p>
                </div>
              )}
            </div>

            {/* Structured JSON-LD Data Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <Code size={16} className="text-[#4F2A7E]" /> Structured Schema
                Data (JSON-LD)
              </label>
              <textarea
                placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "NewsArticle"\n}`}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4F2A7E] bg-white font-mono outline-none transition-all h-32 text-xs leading-normal"
                value={formData.structuredData}
                onChange={(e) => {
                  setIsSchemaCustomized(e.target.value.trim() !== "");
                  setFormData({ ...formData, structuredData: e.target.value });
                  if (errors.structuredData)
                    setErrors({ ...errors, structuredData: "" });
                }}
              />
              {errors.structuredData && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.structuredData}
                </p>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Main Cover Image Upload Component */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#4F2A7E]">
              Cover Feature Image
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative group rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 h-48 sm:h-64 w-full">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white text-[#4F2A7E] px-6 py-2 rounded-full font-bold text-xs"
                  >
                    Change Cover Image
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center hover:border-[#4F2A7E] transition-all cursor-pointer bg-gray-50/50 hover:bg-white"
              >
                <Upload className="mx-auto text-[#4F2A7E] mb-4" size={28} />
                <p className="font-semibold text-[#4F2A7E] text-sm">
                  Click to select feature image file
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports PNG, JPG, or WebP formatting
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#4F2A7E] text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-[#3A1F5E] transition-all disabled:opacity-70 shadow-lg shadow-[#4F2A7E]/10"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={22} />
            ) : (
              <>
                <Save size={18} />
                Publish Article
              </>
            )}
          </button>
        </motion.form>
      </div>

      {/* Status Modals */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={handleModalClose}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-gray-100 z-10"
            >
              {modalType === "success" ? (
                <>
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-50 mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#4F2A7E] mb-2">
                    Article Published!
                  </h3>
                  <p className="text-gray-500 text-sm mb-8">
                    Configurations successfully mapped and saved.
                  </p>
                  <button
                    onClick={handleModalClose}
                    className="w-full py-3.5 bg-[#4F2A7E] text-white rounded-xl font-bold text-sm"
                  >
                    Go to Insights Feed
                  </button>
                </>
              ) : (
                <>
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-6">
                    <XCircle className="h-10 w-10 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-600 mb-2">
                    Publishing Failed
                  </h3>
                  <p className="text-gray-500 text-sm mb-8 bg-red-50 p-3 rounded-xl break-words max-h-32 overflow-y-auto">
                    {apiError}
                  </p>
                  <button
                    onClick={handleModalClose}
                    className="w-full py-3.5 bg-gray-800 text-white rounded-xl font-bold text-sm"
                  >
                    Dismiss and Fix
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

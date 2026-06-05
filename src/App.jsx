import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import SEO from "./components/SEO";

import BlessingAttorneyBlog from "./pages/BlogPost";
import BlogDetails from "./pages/BlogDetails";
import ScrollToTop from "./ScrollToTop";
import CreateArticle from "./pages/CreateArticle";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <SEO
          title="Blessing Attorney Blog"
          description="Legal commentary and resources by Blessing Attorney."
          url="https://blessingattorney.com"
        />
        <Navbar />
        <Routes>
          <Route path="/" element={<BlessingAttorneyBlog />} />
          <Route path="/create-blog-post" element={<CreateArticle />} />
          <Route path="/blog/:slug" element={<BlogDetails />} />
        </Routes>
        <Footer />
      </Layout>
    </BrowserRouter>
  );
}

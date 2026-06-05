import { useState } from "react";
import { Scale, Menu, X } from "lucide-react";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "ABOUT US", href: "/" },
    { name: "BLOG", href: "/" },
    { name: "PROJECTS", href: "/" },
    { name: "PRICING", href: "/" },
  ];

  return (
    <nav className="fixed top-4 left-4 right-4 md:top-6 md:left-6 md:right-6 z-50">
      {/* Main Navbar Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#4F2A7E]/90 backdrop-blur-md rounded-full shadow-2xl border border-white/10">
        
        {/* Logo */}
        <div className="flex items-center z-50">
          <Scale className="w-8 h-8 text-[#D4AF37]" />
          <a href="/" className="text-[#D4AF37] text-xl md:text-[24px] pl-2 font-black tracking-tight">
            Blessing Attorney
          </a>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-semibold tracking-wide text-white/80">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="hover:text-[#D4AF37] transition-colors">
              {link.name}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <button className="px-6 py-2.5 bg-white text-[#4F2A7E] text-sm font-bold rounded-full hover:bg-[#D4AF37] hover:text-white transition-all duration-300">
            CONTACT US
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          className="lg:hidden text-white z-50 p-2" 
          onClick={() => setIsOpen(true)}
          aria-label="Open Menu"
        >
          <Menu size={28} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-[#4F2A7E] lg:hidden flex flex-col items-center justify-center gap-8 transition-opacity duration-300 z-[60] ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {/* Close Icon in Top Right */}
        <button 
          className="absolute top-8 right-8 text-white p-2" 
          onClick={() => setIsOpen(false)}
          aria-label="Close Menu"
        >
          <X size={36} />
        </button>

        {/* Mobile Nav Links */}
        {navLinks.map((link) => (
          <a 
            key={link.name} 
            href={link.href} 
            className="text-3xl text-white font-medium hover:text-[#D4AF37] transition-colors" 
            onClick={() => setIsOpen(false)}
          >
            {link.name}
          </a>
        ))}
        
        {/* Mobile CTA */}
        <button className="mt-8 px-10 py-4 bg-[#D4AF37] text-[#4F2A7E] text-lg font-bold rounded-full hover:scale-105 transition-transform">
          CONTACT US
        </button>
      </div>
    </nav>
  );
};
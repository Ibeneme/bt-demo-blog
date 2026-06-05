import React from "react";
import { Mail, Gavel, Scale } from "lucide-react";
import { FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";

export const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-[#4F2A7E] text-white pt-24 pb-12 font-['Rethink_Sans'] relative overflow-hidden"
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#D4AF37_0.8px,transparent_1px)] [background-size:30px_30px]" />

      <div className="max-w-6xl mx-auto px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
          {/* Brand Section - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="md:col-span-5 space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-9 h-1.5 bg-[#D4AF37] rounded-full" />
              <div className="flex items-center gap-3">
                <Scale className="w-8 h-8 text-[#D4AF37]" />
                <h2 className="text-3xl font-bold tracking-tighter">
                  BLESSING ATTORNEY
                </h2>
              </div>
            </div>

            <p className="text-white/80 max-w-md text-[17px] leading-relaxed">
              Excellence in Legal Strategy • Integrity in Practice
            </p>

            <div className="flex items-center gap-3 text-white/70 text-sm">
              <Gavel size={18} />
              <span>Strategic counsel for forward-thinking businesses</span>
            </div>
          </motion.div>

          {/* Quick Links - Staggered Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-3"
          >
            <h4 className="text-[#D4AF37] font-semibold tracking-[0.125em] uppercase text-sm mb-6">
              Quick Links
            </h4>
            <ul className="space-y-4 text-white/90">
              {[
                "Practice Areas",
                "Our Insights",
                "About the Firm",
                "Our Team",
                "Contact Us",
              ].map((link, index) => (
                <motion.li
                  key={link}
                  whileHover={{ x: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <a
                    href="#"
                    className="hover:text-[#D4AF37] transition-all duration-300 inline-block"
                  >
                    {link}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact & Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-4"
          >
            <h4 className="text-[#D4AF37] font-semibold tracking-[0.125em] uppercase text-sm mb-6">
              Get In Touch
            </h4>

            <a
              href="mailto:info@blessingattorney.com"
              className="group flex items-center gap-4 mb-10 hover:bg-white/5 p-3 -mx-3 rounded-3xl transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#4F2A7E] transition-all">
                <Mail size={22} />
              </div>
              <div>
                <p className="font-medium text-lg">info@blessingattorney.com</p>
                <p className="text-sm text-white/60">
                  We'll respond within 24 hours
                </p>
              </div>
            </a>

            {/* Social Icons with Hover Animation */}
            <div className="flex gap-4">
              {[
                { Icon: FaLinkedin, href: "#" },
                { Icon: FaTwitter, href: "#" },
                { Icon: FaInstagram, href: "#" },
              ].map(({ Icon, href }, index) => (
                <motion.a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-[#D4AF37] hover:text-[#4F2A7E] flex items-center justify-center transition-all duration-300"
                >
                  <Icon size={22} />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        {/* Bottom Bar - Refactored for better alignment */}
        <div className="pt-8 border-t border-white/10 flex flex-col items-center gap-6 text-center">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} Blessing Attorney. All Rights Reserved.
          </p>

          <p className="text-[#D4AF37]/70 text-xs max-w-lg">
            Disclaimer: This content is for informational purposes only and does
            not constitute legal advice.
          </p>

          <a
            href="https://boringthinkers.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 text-[10px] hover:text-[#D4AF37] transition-colors uppercase tracking-[0.2em]"
          >
            Built by Boring Thinkers Limited
          </a>
        </div>
      </div>
    </motion.footer>
  );
};

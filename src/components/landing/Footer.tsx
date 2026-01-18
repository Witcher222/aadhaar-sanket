import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">आ</span>
              </div>
              <div>
                <h3 className="text-xl font-display font-bold">Aadhaar Sanket</h3>
                <p className="text-sm text-white/60">Demographic Intelligence Platform</p>
              </div>
            </div>
            <p className="text-white/70 text-sm max-w-md">
              An initiative by the Ministry of Electronics & Information Technology, 
              Government of India. Empowering data-driven governance for a billion+ citizens.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {['Dashboard', 'Documentation', 'API Access', 'Support'].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
                    {link}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Government Links */}
          <div>
            <h4 className="font-semibold mb-4">Government</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {['India.gov.in', 'UIDAI', 'MeitY', 'Digital India'].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
                    {link}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/50"
        >
          <p>© 2025 Aadhaar Sanket. All rights reserved. Government of India.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

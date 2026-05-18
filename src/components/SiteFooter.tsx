import Link from 'next/link';
import { Sparkles, Share2, Video, Mail, MapPin, Phone } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-10 w-10 bg-[#689f38] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="text-white" size={20} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900">
                Blue<span className="text-[#689f38]">Heaven</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Your neighborhood grocery store, now online. Fresh produce, dairy, and daily essentials delivered right to your doorstep.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-slate-900 font-bold uppercase tracking-widest text-xs mb-6">Popular Categories</h4>
            <ul className="space-y-3">
              {['Fruits & Vegetables', 'Dairy & Breakfast', 'Munchies', 'Cold Drinks & Juices', 'Instant Food'].map((item) => (
                <li key={item}>
                  <Link href="/shop" className="text-slate-600 hover:text-[#689f38] transition-colors text-sm font-medium">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-slate-900 font-bold uppercase tracking-widest text-xs mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {['About Us', 'Contact Us', 'FAQs', 'Delivery Info', 'Terms & Conditions'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-slate-600 hover:text-[#689f38] transition-colors text-sm font-medium">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-slate-900 font-bold uppercase tracking-widest text-xs mb-6">Get in Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-[#689f38] shrink-0" size={18} />
                <span className="text-slate-600 text-sm leading-relaxed">
                  123 Retail Lane, Green Valley, Mumbai 400001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-[#689f38] shrink-0" size={18} />
                <span className="text-slate-600 text-sm font-medium">1800-GROCERY-00</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-[#689f38] shrink-0" size={18} />
                <span className="text-slate-600 text-sm font-medium">hello@blueheaven.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
           <p>© 2026 BlueHeaven Grocery. All rights reserved.</p>
           <div className="flex gap-6">
              <Link href="/admin" className="hover:text-[#689f38] transition-colors">Partner Portal</Link>
              <Link href="#" className="hover:text-[#689f38] transition-colors">Privacy Policy</Link>
           </div>
        </div>
      </div>
    </footer>
  );
}

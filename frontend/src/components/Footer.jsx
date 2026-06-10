import React from 'react';
import { Mail, Phone, MapPin, Heart, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter text-white">
                FOODIE<span className="text-primary-500">RUSHER</span>
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed font-medium">
              Delicious food delivered directly to your doorstep in minutes. Experience the best food delivery service in the city.
            </p>
            <div className="flex items-center gap-4">
              {[Share2, Share2, Share2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="bg-slate-800 p-3 rounded-xl hover:bg-primary-500 hover:text-white transition-all transform hover:-translate-y-1"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 tracking-tight">Quick Links</h4>
            <ul className="space-y-4 font-medium">
              {['Browse Menu', 'Special Offers', 'Restaurant Partners', 'Delivery Areas'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-primary-400 transition-colors flex items-center gap-2 group">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-700 group-hover:bg-primary-500" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 tracking-tight">Support</h4>
            <ul className="space-y-4 font-medium">
              {['Help Center', 'Terms of Service', 'Privacy Policy', 'Refund Policy'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-primary-400 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 tracking-tight">Contact Us</h4>
            <ul className="space-y-6 font-medium">
              <li className="flex items-start gap-3">
                <MapPin className="text-primary-500 mt-1 shrink-0" size={20} />
                <span>Mini Bazar, Varachha, Surat, Gujarat 395006</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-primary-500 shrink-0" size={20} />
                <span>+91 00000 00000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-primary-500 shrink-0" size={20} />
                <span>support@foodierusher.com</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-slate-800 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-semibold text-slate-500">
          <p>© {new Date().getFullYear()} Foodie Rusher. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={14} className="text-red-500 fill-current" /> for Food Lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


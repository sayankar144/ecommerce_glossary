'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { getMediaUrl } from '@/lib/api';

const SLIDES = [
  {
    title: "Fresh Fruits & Vegetables",
    subtitle: "Get up to 20% OFF on daily essentials",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200",
    color: "bg-[#e8f5e9]",
    textColor: "text-[#2e7d32]",
    btnColor: "bg-[#689f38]"
  },
  {
    title: "Dairy & Bakery Staples",
    subtitle: "Freshly baked bread and farm-fresh milk",
    image: "https://images.unsplash.com/photo-1550583726-226ff22580fc?auto=format&fit=crop&q=80&w=1200",
    color: "bg-[#fff3e0]",
    textColor: "text-[#ef6c00]",
    btnColor: "bg-[#ff9800]"
  },
  {
    title: "Premium Groceries",
    subtitle: "Quality products delivered to your doorstep",
    image: "https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&q=80&w=1200",
    color: "bg-[#e3f2fd]",
    textColor: "text-[#1565c0]",
    btnColor: "bg-[#2196f3]"
  }
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
  const prev = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <section className="relative h-[300px] md:h-[450px] w-full overflow-hidden mt-[110px] md:mt-[140px] px-4 md:px-6 mb-8 group">
      <div className="max-w-7xl mx-auto h-full relative">
        {SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out flex items-center rounded-2xl overflow-hidden ${
              index === current ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
            } ${slide.color}`}
          >
            <div className="flex-1 p-8 md:p-16 z-10">
              <h1 className={`text-3xl md:text-5xl font-black mb-4 tracking-tight ${slide.textColor}`}>
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl text-slate-700 mb-8 font-medium">
                {slide.subtitle}
              </p>
              <button className={`${slide.btnColor} text-white px-8 py-3 rounded-md font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-all shadow-lg`}>
                Shop Now
              </button>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:block">
               <img src={slide.image} alt="" className="h-full w-full object-cover" />
               <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} via-transparent to-transparent`} />
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button 
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-white/80 flex items-center justify-center text-slate-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-white/80 flex items-center justify-center text-slate-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-2 rounded-full transition-all ${
                index === current ? 'w-8 bg-slate-800' : 'w-2 bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';
import { ArrowLeft, Play, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';

const pr = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const floaters = Array.from({ length: 6 }, (_, i) => ({
  top: 20 + pr(i * 3.1415) * 60,
  left: 10 + pr(i * 2.7182) * 80,
  accent: i % 2 === 0,
}));

export default function Hero() {
  return (
    <section className="min-h-screen relative overflow-hidden flex items-center pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>منصة رقمية متكاملة</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              نحوّل أفكارك إلى{' '}
              <span className="gradient-text">واقع رقمي</span>{' '}
              مبتكر
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 lg:mr-0">
              نقدم حلولاً تقنية متكاملة تساعدك على النمو والتطور في العالم الرقمي.
              من التصميم إلى التطوير، نحن شريكك المثالي.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/contact">
                <Button size="lg" rightIcon={<ArrowLeft className="w-5 h-5" />}>
                  ابدأ الآن
                </Button>
              </Link>
              <Button variant="outline" size="lg" leftIcon={<Play className="w-5 h-5" />}>
                شاهد الفيديو
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-border">
              {[
                { value: '500+', label: 'مشروع منجز' },
                { value: '150+', label: 'عميل سعيد' },
                { value: '10+', label: 'سنوات خبرة' },
              ].map((stat, index) => (
                <div key={index} className="text-center lg:text-right">
                  <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30" />
              <div className="absolute inset-8 rounded-full border-2 border-dashed border-accent/30" />

              {/* Center Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 rounded-3xl gradient-bg shadow-2xl shadow-primary/30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl font-bold mb-2">R</div>
                    <div className="text-sm opacity-80">المنصة التعليمية</div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              {floaters.map((f, i) => (
                <div
                  key={i}
                  style={{ position: 'absolute', top: `${f.top}%`, left: `${f.left}%` }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${f.accent ? 'bg-primary/20' : 'bg-accent/20'} backdrop-blur-sm flex items-center justify-center shadow-lg`}
                  >
                    <div className={`w-6 h-6 rounded-lg ${f.accent ? 'bg-primary' : 'bg-accent'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

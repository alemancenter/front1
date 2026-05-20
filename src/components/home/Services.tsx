'use client';

import { motion } from '@/lib/motion-lite';
import { BookOpen, FileText, Search, GraduationCap, Shield, RefreshCw } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

const services = [
  {
    icon: BookOpen,
    title: 'مناهج ومواد تعليمية',
    description: 'تنظيم الموارد التعليمية حسب الدولة والصف والمادة والفصل الدراسي.',
    features: ['تصنيف واضح', 'محتوى مناسب للطلاب', 'تصفح سريع'],
    color: 'bg-blue-500',
  },
  {
    icon: FileText,
    title: 'ملفات واختبارات',
    description: 'توفير أوراق عمل واختبارات وملخصات تساعد على المراجعة والتحضير.',
    features: ['ملفات PDF وDOCX', 'مرفقات منظمة', 'معلومات قبل التحميل'],
    color: 'bg-green-500',
  },
  {
    icon: Search,
    title: 'بحث تعليمي متقدم',
    description: 'الوصول إلى المحتوى المناسب عبر البحث والتصفية حسب الصف والمادة.',
    features: ['بحث بالكلمات', 'فلترة حسب المادة', 'نتائج مرتبطة'],
    color: 'bg-purple-500',
  },
  {
    icon: GraduationCap,
    title: 'دعم الطالب والمعلم',
    description: 'محتوى يساعد الطالب في الدراسة ويساند المعلم في التحضير وتنظيم الموارد.',
    features: ['للطلاب', 'للمعلمين', 'لأولياء الأمور'],
    color: 'bg-orange-500',
  },
  {
    icon: RefreshCw,
    title: 'تحديث ومراجعة',
    description: 'مراجعة مستمرة للصفحات والملفات لتحسين الجودة وتجربة المستخدم.',
    features: ['تحديثات دورية', 'تصحيح الأخطاء', 'تحسين المحتوى القديم'],
    color: 'bg-cyan-500',
  },
  {
    icon: Shield,
    title: 'حقوق وشفافية',
    description: 'صفحات واضحة للخصوصية وحقوق الملكية والتواصل وطلبات الإزالة.',
    features: ['سياسة خصوصية', 'حقوق الملكية', 'تواصل واضح'],
    color: 'bg-red-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Services() {
  return (
    <section className="py-20 bg-muted/50" id="services">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium">خدمات تعليمية</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            موارد تعليمية <span className="gradient-text">منظمة وواضحة</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            نوفر تجربة تعليمية تساعد الطالب والمعلم على الوصول إلى الملفات والمقالات المناسبة بسهولة.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card hover className="h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center mb-4`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className={`w-1.5 h-1.5 rounded-full ${service.color}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  FileText,
  Eye,
  Users,
  Activity,
  Newspaper,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import ModernStatsCard from '@/components/dashboard/ModernStatsCard';
import { dashboardService } from '@/lib/api/services/dashboard';
import type { DashboardData, VisitorAnalyticsData } from '@/types';
import { useAuthStore } from '@/store/useStore';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';
import AccessDenied from '@/components/common/AccessDenied';

const ModernChart = dynamic(() => import('@/components/dashboard/ModernChart'), {
  ssr: false,
  loading: () => <div className="h-[300px] rounded-2xl bg-muted/40 animate-pulse" />,
});

export default function DashboardPage() {
  const { isAuthorized } = usePermissionGuard('dashboard.view');
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<VisitorAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch if authorized (or null which means loading auth)
    if (!isAuthorized) return;

    const fetchData = async () => {
      try {
        // 1) بيانات لوحة التحكم الأساسية متاحة لكل من يملك صلاحية dashboard.view
        const dashboard = await dashboardService.getIndex();
        setDashboardData(dashboard);
        
        // 2) بيانات تحليلات الزوار (visitor-analytics) للمستخدمين المخوّلين فقط
        let canViewVisitorAnalytics = false;

        if (user) {
          const adminRoles = ['admin', 'super_admin', 'super-admin', 'manager', 'administrator', 'root'];

          const hasAdminRole = user.roles?.some((r: any) => {
            const roleName = typeof r === 'string' ? r : r.name;
            return adminRoles.includes((roleName || '').toLowerCase());
          }) ?? false;

          const isSuperAdminById = user.id === 1;

          if (hasAdminRole || isSuperAdminById) {
            canViewVisitorAnalytics = true;
          } else {
            canViewVisitorAnalytics = user.permissions?.some((p: any) => {
              const permName = typeof p === 'string' ? p : p.name;
              return permName === 'manage monitoring';
            }) ?? false;
          }
        }

        if (canViewVisitorAnalytics) {
          const analytics = await dashboardService.getAnalytics(7);
          setAnalyticsData(analytics);
        } else {
          setAnalyticsData(null);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthorized, user]);

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    // If user has any permissions, show a welcome message instead of AccessDenied
    // This allows users with specific permissions (e.g. manage posts) to access the dashboard layout
    // even if they don't have full dashboard.view access
    const hasAnyPermission = user?.permissions && user.permissions.length > 0;
    
    if (hasAnyPermission) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
          <div className="bg-card rounded-xl shadow-sm border p-8 max-w-2xl w-full">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-4">مرحباً بك، {user?.name}</h1>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              مرحباً بك في لوحة التحكم. لديك صلاحيات محدودة للوصول إلى أقسام معينة.
              <br />
              يرجى استخدام القائمة الجانبية للتنقل بين الصفحات المصرح لك بها.
            </p>
          </div>
        </div>
      );
    }

    return <AccessDenied />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Transform API data for stats cards
  const stats = [
    {
      title: 'إجمالي المقالات',
      value: (dashboardData?.totals?.articles ?? 0).toLocaleString(),
      change: dashboardData?.trends?.articles?.percentage || 0,
      changeType: (dashboardData?.trends?.articles?.trend === 'up' ? 'increase' : 'decrease') as 'increase' | 'decrease',
      icon: <FileText className="w-6 h-6" />,
      color: 'text-blue-500',
      trendData: dashboardData?.analytics?.articles || []
    },
    {
      title: 'المشاهدات',
      value: (dashboardData?.totals?.online_users ?? 0).toLocaleString(),
      change: 0,
      changeType: 'increase' as const,
      icon: <Eye className="w-6 h-6" />,
      color: 'text-emerald-500',
      trendData: dashboardData?.analytics?.views || []
    },
    {
      title: 'الأخبار',
      value: (dashboardData?.totals?.news ?? 0).toLocaleString(),
      change: dashboardData?.trends?.news?.percentage || 0,
      changeType: (dashboardData?.trends?.news?.trend === 'up' ? 'increase' : 'decrease') as 'increase' | 'decrease',
      icon: <Newspaper className="w-6 h-6" />,
      color: 'text-violet-500',
      trendData: dashboardData?.analytics?.news || []
    },
    {
      title: 'المستخدمين',
      value: (dashboardData?.totals?.users ?? 0).toLocaleString(),
      change: dashboardData?.trends?.users?.percentage || 0,
      changeType: (dashboardData?.trends?.users?.trend === 'up' ? 'increase' : 'decrease') as 'increase' | 'decrease',
      icon: <Users className="w-6 h-6" />,
      color: 'text-orange-500',
      trendData: dashboardData?.analytics?.authors || []
    },
  ];

  // Transform analytics data for chart.
  // full_date is the authoritative YYYY-MM-DD string from the backend.
  // name may be stale/zero if backend date parsing failed, so we always
  // re-derive the display label from full_date on the client.
  const chartData = analyticsData?.chart_data?.map(item => {
    const raw = item.full_date || item.name || '';
    const d = raw ? new Date(raw.length > 10 ? raw : raw + 'T00:00:00') : null;
    const label = d && !isNaN(d.getTime())
      ? d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
      : item.name;
    return { name: label, views: item.pageViews, visitors: item.visitors };
  }) || [];

  return (
    <>
      {/* Welcome Section */}
      <section className="dashboard-hero-card p-6 md:p-8 mb-6">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="dashboard-chip mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black">
              <Activity className="h-4 w-4" />
              مركز إدارة المنصة
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">لوحة التحكم</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              مرحباً {user?.name || 'بك'}، إليك ملخص أداء المشروع، المحتوى، المستخدمين، والنشاطات الأخيرة ضمن واجهة إدارية موحدة.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-white/75 px-5 text-sm font-black text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-primary dark:bg-white/10"
            >
              <ExternalLink className="w-4 h-4" />
              عرض الموقع
            </Link>
            <button className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90">
              تنزيل تقرير
            </button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-6">
        {stats.map((stat, index) => (
          <ModernStatsCard
            key={index}
            {...stat}
          />
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-6 xl:grid-cols-7">
        <div className="dashboard-panel col-span-4 rounded-2xl p-6 min-h-[400px]">
          <ModernChart 
            title="إحصائيات المشاهدات والزوار"
            data={chartData}
            dataKeys={[
              { key: 'views', color: '#10b981', name: 'المشاهدات' },
              { key: 'visitors', color: '#3b82f6', name: 'الزوار' }
            ]}
            height={300}
          />
        </div>
        
        <div className="dashboard-panel col-span-3 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            النشاطات الأخيرة
          </h2>
          <div className="space-y-4">
            {dashboardData?.recentActivities?.map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-secondary/70 rounded-2xl transition-colors cursor-pointer group border border-transparent hover:border-border">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    activity.type === 'article' ? 'bg-blue-500/10 text-blue-500' :
                    activity.type === 'news' ? 'bg-violet-500/10 text-violet-500' :
                    'bg-orange-500/10 text-orange-500'
                  }`}>
                    {activity.type === 'article' && <FileText size={18} />}
                    {activity.type === 'news' && <Newspaper size={18} />}
                    {activity.type === 'comment' && <MessageSquare size={18} />}
                  </div>
                  <div>
                    <p className="font-medium text-sm line-clamp-1">{activity.title || activity.body}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user?.name || activity.author?.name || 'مستخدم'} • {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ar })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {(!dashboardData?.recentActivities || dashboardData.recentActivities.length === 0) && (
              <div className="text-center text-muted-foreground py-8">
                لا توجد نشاطات حديثة
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

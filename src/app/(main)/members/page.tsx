'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from '@/lib/motion-lite';
import StaticPageHeader from '@/components/common/StaticPageHeader';
import {
  Search,
  RefreshCw,
  CheckCircle,
  User as UserIcon,
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  Users as UsersIcon,
  Send,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Image from '@/components/common/AppImage';
import { messagesService } from '@/lib/api/services/messages';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import { getStorageUrl } from '@/lib/utils';
import type { User } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import toast from 'react-hot-toast';

const TEAM_ROLES = [
  { id: 'admin',      name: 'Admin' },
  { id: 'supervisor', name: 'Supervisor' },
  { id: 'moderator',  name: 'Moderator' },
];

function MembersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserAvatarSrc, setSelectedUserAvatarSrc] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<User | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageForm, setMessageForm] = useState({ subject: '', body: '' });
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
  });

  const searchParams = useSearchParams();
  const userIdFromUrl = searchParams.get('user_id');

  const isAdminUser = (u: User | null) => {
    if (!u?.roles || !Array.isArray(u.roles)) return false;
    return u.roles.some((r: any) => {
      const n = typeof r?.name === 'string' ? r.name.trim().toLowerCase() : '';
      return n === 'admin' || n === 'administrator' || n === 'super admin' ||
             n === 'superadmin' || n === 'مدير' || n === 'ادمن' || n === 'إدمن';
    });
  };

  const resolveAdminRecipient = (contextUser: User | null) => {
    if (isAdminUser(contextUser)) return contextUser;
    return users.find((u) => isAdminUser(u)) ?? null;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<any>(
        API_ENDPOINTS.USERS.TEAM,
        { search: filters.search, role: filters.role }
      );
      const data = response.data;
      const list: User[] = Array.isArray(data) ? data
        : Array.isArray(data?.data) ? data.data
        : [];
      setUsers(list);
    } catch (error) {
      console.error('Failed to fetch team data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, role: e.target.value }));
  };

  const handleReset = () => {
    setFilters({ search: '', role: '' });
  };

  const buildAvatarFallback = (name: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=256`;

  const resolveUserAvatarSrc = (user: User | null) => {
    if (!user) return '';
    if (typeof user.profile_photo_url === 'string' && user.profile_photo_url.trim()) {
      return user.profile_photo_url.trim();
    }
    const storageSrc = user.profile_photo_path ? getStorageUrl(user.profile_photo_path) : '';
    if (storageSrc) return storageSrc;
    return buildAvatarFallback(user.name || 'User');
  };

  const handleUserImageError = (e: React.SyntheticEvent<HTMLImageElement>, userName?: string) => {
    const target = e.currentTarget;
    const fallback = buildAvatarFallback(userName || 'User');
    if (target.src !== fallback) target.src = fallback;
  };

  useEffect(() => {
    setSelectedUserAvatarSrc(resolveUserAvatarSrc(selectedUser));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?.id]);

  const openProfile = (user: User) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  useEffect(() => {
    if (userIdFromUrl && users.length > 0 && !isProfileModalOpen) {
      const userToSelect = users.find((u) => String(u.id) === String(userIdFromUrl));
      if (userToSelect) openProfile(userToSelect);
    }
  }, [userIdFromUrl, users, isProfileModalOpen]);

  const closeProfile = () => {
    setIsProfileModalOpen(false);
    setSelectedUser(null);
  };

  const openMessageToAdmin = (contextUser: User | null) => {
    const recipient = resolveAdminRecipient(contextUser);
    if (!recipient) {
      toast.error('لا يوجد أدمن متاح للمراسلة حالياً');
      return;
    }
    setMessageRecipient(recipient);
    setMessageForm({ subject: '', body: '' });
    setIsMessageModalOpen(true);
  };

  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
    setMessageRecipient(null);
    setMessageForm({ subject: '', body: '' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageRecipient) return;
    if (!messageForm.subject.trim()) {
      toast.error('الرجاء كتابة عنوان للرسالة');
      return;
    }
    if (!messageForm.body.trim()) {
      toast.error('الرجاء كتابة محتوى الرسالة');
      return;
    }
    try {
      setIsSendingMessage(true);
      await messagesService.send({
        recipient_id: Number(messageRecipient.id),
        subject: messageForm.subject.trim(),
        body: messageForm.body.trim(),
      });
      toast.success('تم إرسال الرسالة بنجاح');
      closeMessageModal();
    } catch (err: any) {
      toast.error(err?.message || 'فشل في إرسال الرسالة');
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb] font-sans">
      <StaticPageHeader
        title="فريقنا المتميز"
        current="الأعضاء"
        description="تعرف على أعضاء الفريق والمشرفين المتاحين في الموقع مع أدوات بحث وتصفية مباشرة."
      />

      <div className="container mx-auto px-4 py-6">
        <div className="rounded-[1.25rem] border border-blue-100/70 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-grow">
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-primary">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                id="members-search"
                name="search"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="ابحث عن عضو..."
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
            <div className="md:w-1/3">
              <select
                id="members-role"
                name="role"
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={filters.role}
                onChange={handleRoleChange}
              >
                <option value="">جميع الأدوار</option>
                {TEAM_ROLES.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:w-auto">
              <button
                onClick={handleReset}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
              >
                <RefreshCw className="h-5 w-5" />
                <span>إعادة تعيين</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <section className="container mx-auto px-4 pb-16 lg:pb-24">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-[1.25rem] bg-white p-5 shadow-sm sm:h-96 sm:p-6">
                <div className="w-32 h-32 bg-slate-200 rounded-full mx-auto mb-4" />
                <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-3" />
                <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto mb-6" />
                <div className="h-20 bg-slate-100 rounded mb-4" />
                <div className="h-10 bg-slate-200 rounded-full" />
              </div>
            ))}
          </div>
        ) : users.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group overflow-hidden rounded-[1.25rem] border border-blue-100/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="p-6 text-center">
                  <div className="relative w-36 h-36 mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                    <div className="w-full h-full rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-50">
                      <Image
                        src={resolveUserAvatarSrc(user)}
                        alt={user.name}
                        width={144}
                        height={144}
                        className="w-full h-full object-cover"
                        unoptimized
                        onError={(e) => handleUserImageError(e, user.name)}
                      />
                    </div>
                    <div
                      className={`absolute top-3 left-3 w-4 h-4 rounded-full border-2 border-white z-10 ${
                        user.is_online ? 'bg-green-500' : 'bg-slate-400'
                      }`}
                      title={user.is_online ? 'متصل الآن' : 'غير متصل'}
                    />
                    <div className="absolute inset-0 rounded-full bg-slate-900/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {user.social_links && typeof user.social_links === 'object' && !Array.isArray(user.social_links) && (
                        <>
                          {user.social_links['facebook'] && (
                            <a href={String(user.social_links['facebook'])} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 hover:bg-primary text-white rounded-full transition-colors">
                              <Facebook className="w-4 h-4" />
                            </a>
                          )}
                          {user.social_links['twitter'] && (
                            <a href={String(user.social_links['twitter'])} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 hover:bg-sky-500 text-white rounded-full transition-colors">
                              <Twitter className="w-4 h-4" />
                            </a>
                          )}
                          {user.social_links['linkedin'] && (
                            <a href={String(user.social_links['linkedin'])} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 hover:bg-blue-600 text-white rounded-full transition-colors">
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-slate-800">{user.name}</h3>
                    {user.email_verified_at && <CheckCircle className="w-4 h-4 text-blue-500" />}
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {user.roles && user.roles.length > 0 ? (
                      user.roles.map((role, roleIndex) => (
                        <span
                          key={`${user.id}-${role?.id ?? role?.name ?? roleIndex}`}
                          className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium"
                        >
                          {role.name}
                        </span>
                      ))
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">عضو</span>
                    )}
                  </div>

                  <p className="text-slate-500 text-sm mb-6 line-clamp-3 h-[60px]">
                    {user.bio || 'لا توجد نبذة شخصية متاحة.'}
                  </p>

                  <Button
                    type="button"
                    onClick={() => openProfile(user)}
                    variant="outline"
                    className="rounded-full w-full hover:bg-primary hover:text-white border-primary/20 text-primary"
                  >
                    <UserIcon className="w-4 h-4 ml-2" />
                    عرض الملف الشخصي
                  </Button>
                </div>

                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{user.last_seen ? 'آخر ظهور: قريباً' : 'غير نشط مؤخراً'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.25rem] border border-blue-100/70 bg-white py-12 text-center shadow-sm sm:py-16">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <UsersIcon className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">لا يوجد أعضاء</h3>
            <p className="text-slate-500 mb-6">لم يتم العثور على أعضاء متطابقين مع معايير البحث.</p>
            <Button onClick={handleReset} variant="outline">
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة تحميل القائمة
            </Button>
          </div>
        )}
      </section>

      <Modal isOpen={isProfileModalOpen && !!selectedUser} onClose={closeProfile} size="md" title="الملف الشخصي">
        {selectedUser ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-200 bg-slate-50 shrink-0 relative">
                <Image
                  src={selectedUserAvatarSrc}
                  alt={selectedUser.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized
                  onError={() => setSelectedUserAvatarSrc(buildAvatarFallback(selectedUser.name || 'User'))}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xl text-slate-900 truncate">{selectedUser.name}</h3>
                  {selectedUser.email_verified_at ? <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" /> : null}
                </div>
                {selectedUser.roles && selectedUser.roles.length ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedUser.roles.map((role, roleIndex) => (
                      <span
                        key={`${selectedUser.id}-${role?.id ?? role?.name ?? roleIndex}`}
                        className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium"
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-700 text-sm leading-relaxed">
              {selectedUser.bio || 'لا توجد نبذة شخصية متاحة.'}
            </div>

            {selectedUser.social_links && typeof selectedUser.social_links === 'object' && !Array.isArray(selectedUser.social_links) ? (
              <div className="flex items-center gap-2">
                {selectedUser.social_links['facebook'] ? (
                  <a href={String(selectedUser.social_links['facebook'])} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors" aria-label="Facebook">
                    <Facebook className="w-5 h-5" />
                  </a>
                ) : null}
                {selectedUser.social_links['twitter'] ? (
                  <a href={String(selectedUser.social_links['twitter'])} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors" aria-label="Twitter">
                    <Twitter className="w-5 h-5" />
                  </a>
                ) : null}
                {selectedUser.social_links['linkedin'] ? (
                  <a href={String(selectedUser.social_links['linkedin'])} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-colors" aria-label="LinkedIn">
                    <Linkedin className="w-5 h-5" />
                  </a>
                ) : null}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={closeProfile}>إغلاق</Button>
              <Button
                variant="primary"
                onClick={() => { setIsProfileModalOpen(false); openMessageToAdmin(selectedUser); }}
                leftIcon={<Send className="w-4 h-4" />}
              >
                مراسلة الأدمن
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={isMessageModalOpen && !!messageRecipient}
        onClose={closeMessageModal}
        size="md"
        title={messageRecipient ? `مراسلة ${messageRecipient.name}` : 'مراسلة الأدمن'}
      >
        <form onSubmit={handleSendMessage} className="space-y-5">
          <Input
            label="عنوان الرسالة"
            name="subject"
            value={messageForm.subject}
            onChange={(e) => setMessageForm((prev) => ({ ...prev, subject: e.target.value }))}
            placeholder="اكتب عنواناً مختصراً..."
            required
          />
          <Textarea
            label="نص الرسالة"
            name="body"
            value={messageForm.body}
            onChange={(e) => setMessageForm((prev) => ({ ...prev, body: e.target.value }))}
            placeholder="اكتب رسالتك هنا..."
            required
          />
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={closeMessageModal} disabled={isSendingMessage}>إلغاء</Button>
            <Button type="submit" variant="primary" isLoading={isSendingMessage} leftIcon={<Send className="w-4 h-4" />}>إرسال</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function MembersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <MembersContent />
    </Suspense>
  );
}

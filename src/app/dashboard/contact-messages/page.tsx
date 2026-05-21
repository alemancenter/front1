import { redirect } from 'next/navigation';

export default function DashboardContactMessagesRedirectPage() {
  redirect('/dashboard/messages?tab=contact');
}

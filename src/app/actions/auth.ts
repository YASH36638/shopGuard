'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const key = formData.get('masterKey');
  const actualKey = process.env.MASTER_ACCESS_KEY || 'shopguard123'; // Fallback if they forget to add it

  if (key === actualKey) {
    const cookieStore = await cookies();
    cookieStore.set('shopguard_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
    
    redirect('/');
  }

  return { error: 'Invalid Access Key. Access Denied.' };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('shopguard_auth');
  redirect('/login');
}

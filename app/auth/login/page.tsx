'use client'
import { useEffect } from 'react';


export default function LoginPage() {
useEffect(() => { window.location.href = '/api/auth/signin'; }, []);
return <div className="p-6">Redirecting to Google…</div>
}
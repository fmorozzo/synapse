'use client';

import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth/actions';

interface UserMenuProps {
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:flex items-center gap-2 text-sm">
        <User className="w-4 h-4" />
        <span>{displayName}</span>
      </div>
      <form action={signOut}>
        <Button variant="ghost" size="sm" type="submit">
          <LogOut className="w-4 h-4 mr-2" />
          <span className="hidden md:inline">Sign Out</span>
        </Button>
      </form>
    </div>
  );
}


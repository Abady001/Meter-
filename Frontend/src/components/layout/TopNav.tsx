'use client';

import React from 'react';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  ChevronDown,
  Check,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { useAuthStore, getRoleLabel, getRoleColor } from '@/lib/mock-auth';
import { useTheme } from '@/components/layout/ThemeProvider';
import { useT, useLocale } from '@/lib/i18n/context';
import { useUnreadCount, useNotifications, useMarkRead, useMarkAllRead, useDeleteNotification } from '@/hooks/use-notifications';
import { AreaProjectSwitcher } from './AreaProjectSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface TopNavProps {
  onMenuClick: () => void;
  onSearchClick?: () => void;
}

export function TopNav({ onMenuClick, onSearchClick }: TopNavProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const t = useT();
  const { locale, toggleLocale } = useLocale();

  const { data: unreadData } = useUnreadCount();
  const { data: notifData } = useNotifications();
  const markReadMutation = useMarkRead();
  const markAllReadMutation = useMarkAllRead();
  const deleteNotifMutation = useDeleteNotification();
  const unacknowledgedCount = unreadData?.count ?? 0;
  const notifications = notifData?.items ?? [];

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-16 glass-card border-b border-border">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden size-9"
                  onClick={onMenuClick}
                >
                  <Menu className="size-5" />
                  <span className="sr-only">{t('nav.menu')}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('nav.menu')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:block">
              Meter <span className="text-primary">Verse</span>
            </span>
          </div>
          {/* Area + Project Context */}
          <div className="hidden lg:flex items-center gap-1 ml-2 text-xs text-muted-foreground border-s border-border ps-3">
            <AreaProjectSwitcher />
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('nav.search')}
              className="ps-9 h-9 bg-secondary/50 border-border/50 focus:bg-background"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="size-9" onClick={onSearchClick}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search (Ctrl+K)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative size-9">
                <Bell className="size-[18px]" />
                {unacknowledgedCount > 0 && (
                  <Badge className="absolute -top-0.5 -end-0.5 size-4 p-0 flex items-center justify-center text-[10px] bg-destructive text-white border-0">
                    {unacknowledgedCount > 9 ? '9+' : unacknowledgedCount}
                  </Badge>
                )}
                <span className="sr-only">{t('nav.notifications')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unacknowledgedCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => markAllReadMutation.mutate()}>
                    <CheckCheck className="h-3 w-3" /> Mark all read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
              ) : (
                <ScrollArea className="h-[300px]">
                  {notifications.slice(0, 20).map((n: any) => (
                    <div key={n.id} className={cn('flex items-start gap-2 p-3 border-b border-border/30 text-sm', !n.isRead && 'bg-muted/20')}>
                      <div className="flex-1 min-w-0">
                        <p className={cn('font-medium truncate', !n.isRead && 'text-foreground')}>{n.title}</p>
                        {n.body && <p className="text-xs text-muted-foreground truncate">{n.body}</p>}
                        <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {!n.isRead && (
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => markReadMutation.mutate(n.id)}>
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => deleteNotifMutation.mutate(n.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9"
                  onClick={toggleTheme}
                >
                  {resolvedTheme === 'dark' ? (
                    <Sun className="size-[18px]" />
                  ) : (
                    <Moon className="size-[18px]" />
                  )}
                  <span className="sr-only">{resolvedTheme === 'dark' ? t('nav.theme.light') : t('nav.theme.dark')}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {resolvedTheme === 'dark' ? t('nav.theme.light') : t('nav.theme.dark')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Language Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9"
                  onClick={toggleLocale}
                >
                  <span className="text-xs font-bold size-[18px] flex items-center justify-center">
                    {locale === 'en' ? 'ع' : 'EN'}
                  </span>
                  <span className="sr-only">{t('nav.language')}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {locale === 'en' ? t('common.arabic') : t('common.english')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                <Avatar className="size-7">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
                  {user?.name}
                </span>
                <ChevronDown className="size-3 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs text-muted-foreground leading-none mt-1">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <User className="size-4" />
                <span>{t('nav.profile')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <span className={cn('text-xs rounded px-1.5 py-0.5', getRoleColor(user?.role ?? 'customer'))}>
                  {getRoleLabel(user?.role ?? 'customer')}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-destructive focus:text-destructive"
                onClick={logout}
              >
                <LogOut className="size-4" />
                <span>{t('nav.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

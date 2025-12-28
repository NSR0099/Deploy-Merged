import React from 'react';
import { Shield, Bell, User, LogOut, RefreshCw, Settings, ChevronDown, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { useEmergency } from '@/contexts/EmergencyContext';
import { useNavigate } from 'react-router-dom';
import { getTimeAgo } from '@/data/mockData';
import { cn } from '@/lib/utils';

const TopNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { 
    isLiveUpdates, 
    isSystemOnline, 
    toggleLiveUpdates, 
    notifications, 
    markNotificationRead,
    getUnreadNotificationCount,
    refreshData,
  } = useEmergency();
  const navigate = useNavigate();
  const unreadCount = getUnreadNotificationCount();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-card/95 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left: Logo & Status */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(221 83% 48%), hsl(217 91% 60%))' }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground leading-tight">
                Emergency Command
              </h1>
              <p className="text-xs text-muted-foreground">Smart Response System</p>
            </div>
          </button>

          {/* System Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
            <div className={cn(
              "w-2.5 h-2.5 rounded-full",
              isSystemOnline ? "status-online" : "status-offline"
            )} />
            <span className="text-xs font-medium text-foreground">
              {isSystemOnline ? 'System Online' : 'System Offline'}
            </span>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {/* Live Updates Toggle */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
            <Radio className={cn(
              "w-4 h-4",
              isLiveUpdates ? "text-status-online" : "text-muted-foreground"
            )} />
            <span className="text-xs font-medium text-foreground">Live</span>
            <Switch 
              checked={isLiveUpdates} 
              onCheckedChange={toggleLiveUpdates}
              className="scale-75"
            />
          </div>

          {/* Manual Refresh */}
          <Button variant="ghost" size="icon" onClick={refreshData} className="text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-3 border-b border-border">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <p className="text-xs text-muted-foreground">{unreadCount} unread alerts</p>
              </div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={cn(
                        "p-3 border-b border-border/50 cursor-pointer hover:bg-accent/50 transition-colors",
                        !notif.read && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {notif.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            {getTimeAgo(notif.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="w-8 h-8 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {/* Profile Section */}
              <div className="p-4 flex flex-col items-center text-center border-b border-border">
                <Avatar className="w-16 h-16 mb-3 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold text-foreground">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <span className="mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {user?.role}
                </span>
              </div>
              <DropdownMenuItem className="gap-2 py-2.5">
                <User className="w-4 h-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 py-2.5">
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="gap-2 py-2.5 text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
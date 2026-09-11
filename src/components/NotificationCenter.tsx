import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, Clock, AlertTriangle, Check, Trash2, Volume2, Sparkles, X, ChevronRight, Send } from 'lucide-react';
import { InAppNotification } from '../types';
import { requestPushPermission, getPushPermissionStatus } from '../utils/notificationService';

interface NotificationCenterProps {
  notifications: InAppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNavigateToSignalement: (signalementId: string) => void;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNavigateToSignalement
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pushStatus, setPushStatus] = useState<NotificationPermission>('default');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPushStatus(getPushPermissionStatus());
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRequestPush = async () => {
    const perm = await requestPushPermission();
    setPushStatus(perm);
  };

  const getStatusBadge = (status: InAppNotification['status']) => {
    switch (status) {
      case 'Nettoyé':
        return {
          icon: CheckCircle2,
          bgColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dotColor: 'bg-emerald-500'
        };
      case 'En cours':
        return {
          icon: Clock,
          bgColor: 'bg-amber-100 text-amber-800 border-amber-200',
          dotColor: 'bg-amber-500'
        };
      case 'Signalé':
      default:
        return {
          icon: AlertTriangle,
          bgColor: 'bg-blue-100 text-blue-800 border-blue-200',
          dotColor: 'bg-blue-500'
        };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition focus:outline-none"
        title="Centre de notifications REGEDEK"
        aria-label="Centre de notifications"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 bg-gray-50/90 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-gray-900">Notifications</span>
              {unreadCount > 0 ? (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                  {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-[11px] text-gray-400">À jour</span>
              )}
            </div>

            <div className="flex items-center space-x-1">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold px-2 py-1 rounded-lg hover:bg-emerald-50 transition"
                  title="Tout marquer comme lu"
                >
                  Tout lire
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition"
                  title="Effacer l'historique"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Push Notifications Enable Banner */}
          {pushStatus !== 'granted' && (
            <div className="bg-emerald-50/70 p-3 border-b border-emerald-100 flex items-center justify-between gap-2">
              <div className="text-[11px] text-emerald-900">
                <span className="font-semibold block">Activer les alertes push</span>
                <span className="text-emerald-700 text-[10px]">Recevoir un avertissement dès qu'un site est nettoyé.</span>
              </div>
              <button
                onClick={handleRequestPush}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-sm whitespace-nowrap transition"
              >
                Activer
              </button>
            </div>
          )}

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 space-y-2">
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-gray-600">Aucune notification pour le moment</p>
                <p className="text-[11px] text-gray-400">
                  Vous serez alerté dès qu'une équipe REGEDEK prend en charge vos signalements.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const badge = getStatusBadge(n.status);
                const IconComponent = badge.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      onMarkAsRead(n.id);
                      onNavigateToSignalement(n.signalementId);
                      setIsOpen(false);
                    }}
                    className={`p-3.5 hover:bg-gray-50/90 transition cursor-pointer flex items-start space-x-3 relative group ${
                      !n.read ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    {!n.read && (
                      <span className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    )}

                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${badge.bgColor}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-xs font-bold truncate ${!n.read ? 'text-gray-950' : 'text-gray-700'}`}>
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 shrink-0">{n.timestamp}</span>
                      </div>

                      <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>

                      <div className="flex items-center space-x-2 pt-0.5">
                        <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          {n.commune} • {n.quartier}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          Réf: {n.signalementId}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition shrink-0 self-center" />
                  </div>
                );
              })
            )}
          </div>

          {/* Footer - Real-time verified indicator */}
          <div className="p-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1 text-[11px] text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Actions réelles vérifiées</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">REGEDEK Sentinelle</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Floating Toast Alert for new real-time changes
export function RealtimeNotificationToast({
  notification,
  onClose,
  onClick
}: {
  notification: InAppNotification | null;
  onClose: () => void;
  onClick: () => void;
}) {
  if (!notification) return null;

  const isCleaned = notification.status === 'Nettoyé';

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-emerald-200 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start space-x-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          isCleaned ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
        }`}>
          {isCleaned ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900">{notification.title}</span>
            <span className="text-[10px] text-gray-400">{notification.timestamp}</span>
          </div>
          <p className="text-xs text-gray-600 mt-0.5 leading-snug">{notification.message}</p>
          <div className="mt-1.5 flex items-center space-x-2">
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {notification.commune} - {notification.quartier}
            </span>
            <span className="text-[10px] text-emerald-700 underline font-medium">Voir le site</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

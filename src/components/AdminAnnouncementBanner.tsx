import React, { useState, useEffect } from 'react';
import { Megaphone, AlertTriangle, Info, X, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { AdminAnnouncement } from '../types';
import { autoSyncClient } from '../utils/autoSyncClient';

interface AdminAnnouncementBannerProps {
  announcement?: AdminAnnouncement | null;
  onDismiss?: () => void;
}

export function AdminAnnouncementBanner({
  announcement,
  onDismiss
}: AdminAnnouncementBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (announcement?.id) {
      const dismissed = autoSyncClient.isAnnouncementDismissed(announcement.id);
      setIsDismissed(dismissed);
    }
  }, [announcement]);

  if (!announcement || isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    if (announcement.id) {
      autoSyncClient.dismissAnnouncement(announcement.id);
    }
    if (onDismiss) onDismiss();
  };

  const getSeverityStyles = () => {
    switch (announcement.severity) {
      case 'urgent':
        return {
          bg: 'bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-500',
          badge: 'bg-red-800/80 text-white border-red-400',
          icon: <AlertTriangle className="w-5 h-5 text-white shrink-0 animate-bounce" />,
          label: 'ALERTE SANITAIRE PRIORITAIRE'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-amber-600 to-orange-700 text-white border-amber-400',
          badge: 'bg-amber-800/80 text-white border-amber-300',
          icon: <Megaphone className="w-5 h-5 text-white shrink-0" />,
          label: 'COMMUNIQUÉ OFFICIEL IMPORTANT'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-indigo-700 to-blue-800 text-white border-indigo-500',
          badge: 'bg-indigo-900/80 text-indigo-100 border-indigo-400',
          icon: <Info className="w-5 h-5 text-white shrink-0" />,
          label: 'NOTIFICATION DE LA DIRECTION'
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <div className={`w-full ${styles.bg} border-b shadow-lg py-3 px-4 sm:px-6 relative transition-all duration-300 animate-fadeIn`}>
      <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="p-1.5 bg-black/20 rounded-xl shrink-0">
            {styles.icon}
          </div>

          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase border ${styles.badge}`}>
                {styles.label}
              </span>
              <span className="text-xs font-black tracking-tight text-white">
                {announcement.title}
              </span>
            </div>

            <p className="text-xs text-white/95 leading-relaxed font-medium">
              {announcement.message}
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white/90 transition shrink-0 ml-2"
          title="Masquer cette annonce"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

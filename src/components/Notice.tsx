import type { IconType } from 'react-icons';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { IoWarningOutline } from 'react-icons/io5';
import { MdErrorOutline } from 'react-icons/md';

export type NoticeType = 'error' | 'warning' | 'info';

export interface NoticeData {
  type: NoticeType;
  title: string;
  message: string;
}

interface NoticeProps {
  notice: NoticeData | null;
  onClose?: () => void;
}

const ICONS: Record<NoticeType, IconType> = {
  error: MdErrorOutline,
  warning: IoWarningOutline,
  info: IoIosInformationCircleOutline,
};

export default function Notice({ notice, onClose }: NoticeProps) {
  if (!notice) {
    return null;
  }

  const Icon = ICONS[notice.type];

  return (
    <div className={`notice notice-${notice.type}`} role="alert">
      <div className="notice-body">
        <span className="notice-icon">
          <Icon aria-hidden="true" />
        </span>
        <div>
          <strong>{notice.title}</strong>
          <div>{notice.message}</div>
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          className="btn"
          aria-label="Закрыть уведомление"
          onClick={onClose}
        >
          ✕
        </button>
      )}
    </div>
  );
}
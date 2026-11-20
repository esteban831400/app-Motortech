import { IconCheckCircle, IconAlert, IconClose } from './icons';

const ICONS = {
  success: IconCheckCircle,
  error: IconAlert,
  info: IconAlert,
};

// Empile les toasts actifs en bas de l'écran (au-dessus de la bottom nav mobile).
export default function ToastViewport({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-viewport">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] ?? IconCheckCircle;
        return (
          <div key={t.id} className={`toast toast-${t.type}`} role="status">
            <Icon width={17} height={17} className="toast-icon" />
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => onDismiss(t.id)} aria-label="Fermer">
              <IconClose width={14} height={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

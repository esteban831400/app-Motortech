import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconClose } from './icons';

// Modale générique : overlay + panel, se ferme sur Echap ou clic sur l'overlay.
// Rendue dans <body> via un portail : les cartes en verre (backdrop-filter)
// deviennent sinon le bloc conteneur de l'overlay "fixed", qui serait rogné.
export default function Modal({ title, subtitle, onClose, children, footer, size = 'md' }) {
  useEffect(() => {
    const handleKey = (e) => {
      // Ignoré si la palette de commande (au-dessus) a déjà traité Échap.
      if (e.key === 'Escape' && !e.defaultPrevented) onClose();
    };
    window.addEventListener('keydown', handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal-panel modal-${size}`} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="modal-title-group">
            <h2>{title}</h2>
            {subtitle && <p className="modal-subtitle">{subtitle}</p>}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">
            <IconClose width={18} height={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

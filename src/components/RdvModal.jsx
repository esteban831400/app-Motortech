import { useState } from 'react';
import Modal from './Modal';
import { useApp } from '../hooks/AppContext';
import { useToast } from '../hooks/ToastContext';
import { PRESTATIONS } from '../utils/constants';
import { formatDate } from '../utils/format';
import { IconCalendar, IconMessage } from './icons';

const SLOTS = [
  { date: '2026-11-24', heures: ['09h00', '10h30', '14h00', '16h30'] },
  { date: '2026-11-25', heures: ['10h30', '14h00', '15h30'] },
  { date: '2026-11-26', heures: ['14h00', '16h30'] },
  { date: '2026-11-27', heures: ['09h00', '11h00', '16h00'] },
];

// « Prendre RDV » : même formulaire que celui utilisé par l'agent IA au téléphone.
export default function RdvModal() {
  const { closeRdv } = useApp();
  const toast = useToast();
  const [form, setForm] = useState({ nom: '', tel: '', immat: '', vehicule: '', prestation: 'stage1' });
  const [slot, setSlot] = useState({ date: SLOTS[0].date, heure: SLOTS[0].heures[0] });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    closeRdv();
    toast.success(
      `RDV ${PRESTATIONS[form.prestation].label} confirmé le ${formatDate(slot.date)} à ${slot.heure} · SMS de confirmation envoyé`
    );
  };

  return (
    <Modal
      title="Prendre RDV"
      subtitle="Le client reçoit une confirmation par SMS, puis un rappel la veille."
      onClose={closeRdv}
      footer={
        <>
          <button className="btn btn-secondary" onClick={closeRdv}>
            Annuler
          </button>
          <button className="btn btn-primary" form="rdv-form" type="submit">
            <IconCalendar width={15} height={15} />
            Confirmer le RDV
          </button>
        </>
      }
    >
      <form id="rdv-form" className="form-grid" onSubmit={submit}>
        <div className="field">
          <label htmlFor="rdv-nom">Client</label>
          <input id="rdv-nom" required placeholder="Julien Martin" value={form.nom} onChange={set('nom')} />
        </div>
        <div className="field">
          <label htmlFor="rdv-tel">Téléphone</label>
          <input id="rdv-tel" required type="tel" placeholder="06 12 47 83 20" value={form.tel} onChange={set('tel')} />
        </div>
        <div className="field">
          <label htmlFor="rdv-immat">Immatriculation</label>
          <input
            id="rdv-immat"
            placeholder="GE-482-PL"
            value={form.immat}
            onChange={(e) => setForm((f) => ({ ...f, immat: e.target.value.toUpperCase() }))}
          />
        </div>
        <div className="field">
          <label htmlFor="rdv-veh">Véhicule</label>
          <input id="rdv-veh" placeholder="Golf 7 GTI 2.0 TSI" value={form.vehicule} onChange={set('vehicule')} />
        </div>
        <div className="field field-full">
          <label htmlFor="rdv-presta">Prestation</label>
          <select id="rdv-presta" value={form.prestation} onChange={set('prestation')}>
            {['stage1', 'stage2', 'stage3', 'e85', 'fap', 'meca'].map((k) => (
              <option key={k} value={k}>
                {PRESTATIONS[k].label}
              </option>
            ))}
          </select>
        </div>
        <div className="field field-full">
          <label>Créneaux disponibles</label>
          <div className="slot-days">
            {SLOTS.map((d) => (
              <div key={d.date} className="slot-day">
                <span className="slot-day-label">{formatDate(d.date)}</span>
                <div className="slot-hours">
                  {d.heures.map((h) => {
                    const on = slot.date === d.date && slot.heure === h;
                    return (
                      <button
                        type="button"
                        key={h}
                        className={`chip ${on ? 'chip-active' : ''}`}
                        onClick={() => setSlot({ date: d.date, heure: h })}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="field-full form-hint">
          <IconMessage width={14} height={14} /> SMS envoyé : « Votre RDV chez Motortech Toulon est confirmé le{' '}
          {formatDate(slot.date)} à {slot.heure}. »
        </p>
      </form>
    </Modal>
  );
}

// Interrupteur on/off (même composant que dans Appesteban).
export default function Switch({ checked, onChange, label }) {
  return (
    <label className="switch" title={label}>
      <input type="checkbox" checked={checked} onChange={onChange} aria-label={label} />
      <span className="switch-track">
        <span className="switch-thumb" />
      </span>
    </label>
  );
}

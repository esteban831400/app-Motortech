import { IconStar } from './icons';

export default function Stars({ value, size = 14 }) {
  return (
    <span className="stars" aria-label={`${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <IconStar key={i} width={size} height={size} className={i <= Math.round(value) ? 'star-on' : 'star-off'} />
      ))}
    </span>
  );
}

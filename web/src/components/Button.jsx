import { Link } from 'react-router-dom';
import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  to,       // internal link (react-router)
  href,     // external link
  ...props
}) {
  const cls = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth  && styles.fullWidth,
    loading    && styles.loading,
  ].filter(Boolean).join(' ');

  if (to) {
    return <Link to={to} className={cls} {...props}>{children}</Link>;
  }
  if (href) {
    return <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
  }

  return (
    <button type={type} className={cls} disabled={disabled || loading} onClick={onClick} {...props}>
      {loading ? <span className={styles.spinner} /> : children}
    </button>
  );
}

import { Link } from 'react-router-dom'

export function Wordmark({ light = false }) {
  return (
    <span className={light ? 'wordmark on-dark' : 'wordmark'}>
      <span className="wm-astro">Astro</span>
      <span className="wm-greet">Greet</span>
    </span>
  )
}

export default function Brand({ to = '/', onClick, light = false }) {
  return (
    <Link className={light ? 'brand on-dark' : 'brand'} to={to} onClick={onClick}>
      <span className="logo" aria-hidden="true"><span>☀</span></span>
      <Wordmark light={light} />
    </Link>
  )
}

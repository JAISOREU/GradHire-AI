export const BrandMark = () => (
  <span className="animated-logo__mark" aria-hidden="true">
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 8L5 15.5L20 23L35 15.5L20 8Z" className="logo-cap" />
      <path d="M20 23V31" className="logo-tassel" />
      <circle cx="20" cy="32.5" r="1.8" className="logo-tassel-dot" />
      <path d="M5 15.5H35M20 8V23M5 15.5L20 23M35 15.5L20 23" className="logo-lines" />
      <circle cx="5" cy="15.5" r="2.5" className="logo-node logo-node--1" />
      <circle cx="20" cy="8" r="2.5" className="logo-node logo-node--2" />
      <circle cx="35" cy="15.5" r="2.5" className="logo-node logo-node--3" />
      <circle cx="20" cy="23" r="2.5" className="logo-node logo-node--4" />
    </svg>
  </span>
);
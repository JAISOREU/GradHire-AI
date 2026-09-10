import { AnimatedLogo } from './AnimatedLogo';

type LogoProps = {
  size?: number;
  className?: string;
};

export const Logo = ({ size = 32, className = '' }: LogoProps) => (
  <AnimatedLogo size={size} showText={false} className={className} />
);
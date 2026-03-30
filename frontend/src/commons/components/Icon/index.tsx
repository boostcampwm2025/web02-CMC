import { SVG_ICONS, TIER_ICONS } from './icons';
import type { IconName, TierName } from './icons';
import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName | TierName;
  alt?: string;
}

export default function Icon({ name, alt, ...svgProps }: IconProps) {
  if (name in TIER_ICONS) {
    return <img src={TIER_ICONS[name as TierName]} className={svgProps.className} alt={alt ?? name} />;
  }

  const SvgIcon = SVG_ICONS[name as IconName];

  return <SvgIcon {...svgProps} />;
}

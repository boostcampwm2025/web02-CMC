import BattleIcon from '@/assets/icon/battle.svg?react';
import CheckIcon from '@/assets/icon/check.svg?react';
import ClockIcon from '@/assets/icon/clock.svg?react';
import CloseIcon from '@/assets/icon/close.svg?react';
import CopyIcon from '@/assets/icon/copy.svg?react';
import CrownIcon from '@/assets/icon/crown.svg?react';
import DevIcon from '@/assets/icon/dev.svg?react';
import DownArrowIcon from '@/assets/icon/downArrow.svg?react';
import ExclamationIcon from '@/assets/icon/exclamation.svg?react';
import EyeIcon from '@/assets/icon/eye.svg?react';
import GithubIcon from '@/assets/icon/github.svg?react';
import KakaoIcon from '@/assets/icon/kakao.svg?react';
import LikeIcon from '@/assets/icon/like.svg?react';
import MessageIcon from '@/assets/icon/message.svg?react';
import PauseIcon from '@/assets/icon/pause.svg?react';
import PeopleIcon from '@/assets/icon/people.svg?react';
import PeoplesIcon from '@/assets/icon/peoples.svg?react';
import PlayIcon from '@/assets/icon/play.svg?react';
import PlusIcon from '@/assets/icon/plus.svg?react';
import QuestionIcon from '@/assets/icon/question.svg?react';
import ScaleIcon from '@/assets/icon/scale.svg?react';
import SendIcon from '@/assets/icon/send.svg?react';
import ShieldIcon from '@/assets/icon/shield.svg?react';
import SkipIcon from '@/assets/icon/skip.svg?react';
import SoundIcon from '@/assets/icon/sound.svg?react';
import SwitchIcon from '@/assets/icon/switch.svg?react';
import TimelineIcon from '@/assets/icon/timeline.svg?react';
import TimerIcon from '@/assets/icon/timer.svg?react';
import TrophyIcon from '@/assets/icon/trophy.svg?react';
import UserIcon from '@/assets/icon/user.svg?react';
import VoteIcon from '@/assets/icon/vote.svg?react';
import WorldIcon from '@/assets/icon/world.svg?react';

import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Award,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Code2,
  ExternalLink,
  Flag,
  Flame,
  Home,
  Medal,
  RefreshCw,
  Shuffle,
  Sparkles,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import BronzePng from '@/assets/icon/bronze.png';
import SilverPng from '@/assets/icon/silver.png';
import GoldPng from '@/assets/icon/gold.png';
import DiamondPng from '@/assets/icon/diamond.png';
import MasterPng from '@/assets/icon/master.png';
import GrandmasterPng from '@/assets/icon/grandmaster.png';

import type { FC, SVGProps } from 'react';

export type SvgIconComponent = FC<SVGProps<SVGSVGElement>>;

const lc = (icon: LucideIcon): SvgIconComponent => icon as SvgIconComponent;

export const SVG_ICONS = {
  battle: BattleIcon,
  check: CheckIcon,
  clock: ClockIcon,
  close: CloseIcon,
  copy: CopyIcon,
  crown: CrownIcon,
  dev: DevIcon,
  downArrow: DownArrowIcon,
  exclamation: ExclamationIcon,
  eye: EyeIcon,
  github: GithubIcon,
  kakao: KakaoIcon,
  like: LikeIcon,
  message: MessageIcon,
  pause: PauseIcon,
  people: PeopleIcon,
  peoples: PeoplesIcon,
  play: PlayIcon,
  plus: PlusIcon,
  question: QuestionIcon,
  scale: ScaleIcon,
  send: SendIcon,
  shield: ShieldIcon,
  skip: SkipIcon,
  sound: SoundIcon,
  switch: SwitchIcon,
  timeline: TimelineIcon,
  timer: TimerIcon,
  trophy: TrophyIcon,
  user: UserIcon,
  vote: VoteIcon,
  world: WorldIcon,
  // lucide-react icons
  activity: lc(Activity),
  alertTriangle: lc(AlertTriangle),
  arrowDown: lc(ArrowDown),
  arrowRight: lc(ArrowRight),
  award: lc(Award),
  bookOpen: lc(BookOpen),
  chevronDown: lc(ChevronDown),
  chevronLeft: lc(ChevronLeft),
  chevronRight: lc(ChevronRight),
  chevronUp: lc(ChevronUp),
  code2: lc(Code2),
  externalLink: lc(ExternalLink),
  flag: lc(Flag),
  flame: lc(Flame),
  home: lc(Home),
  medal: lc(Medal),
  refreshCw: lc(RefreshCw),
  shuffle: lc(Shuffle),
  sparkles: lc(Sparkles),
  target: lc(Target),
  trendingUp: lc(TrendingUp),
  zap: lc(Zap)
} as const satisfies Record<string, SvgIconComponent>;

export const TIER_ICONS = {
  bronze: BronzePng,
  silver: SilverPng,
  gold: GoldPng,
  diamond: DiamondPng,
  master: MasterPng,
  grandmaster: GrandmasterPng
} as const satisfies Record<string, string>;

export type IconName = keyof typeof SVG_ICONS;
export type TierName = keyof typeof TIER_ICONS;

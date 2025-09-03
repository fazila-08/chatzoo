
import React from 'react';
import type { ModelInfo } from './types';
import { CatIcon, GoldfishIcon, SlothIcon } from './components/icons';

export const MODELS: ModelInfo[] = [
  {
    id: 'cat',
    name: 'Catalina ᓚᘏᗢ',
    description: 'Replies only in meows and cat emojis.',
    avatar: <CatIcon />,
  },
  {
    id: 'goldfish',
    name: 'Goldie the Goldfish',
    description: 'Has the memory of a goldfish. No recollection of past conversations.',
    avatar: <GoldfishIcon />,
  },
  {
    id: 'sloth',
    name: 'Sid the Sloth',
    description: 'Responds very... very... slowly... one... letter... at... a... time.',
    avatar: <SlothIcon />,
  },
];

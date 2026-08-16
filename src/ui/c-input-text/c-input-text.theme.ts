import { defineThemes } from '../theme/theme.models';

export const { useTheme } = defineThemes({
  dark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',

    focus: {
      backgroundColor: '#27272a',
    },
  },
  light: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',

    focus: {
      backgroundColor: '#ffffff',
    },
  },
});

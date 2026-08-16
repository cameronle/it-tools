import { defineThemes } from '../theme/theme.models';

export const { useTheme } = defineThemes({
  dark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  light: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
});

import type { GlobalThemeOverrides } from 'naive-ui';

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#10b981',
    primaryColorHover: '#059669',
    primaryColorPressed: '#047857',
    primaryColorSuppl: '#10b981',
    borderRadius: '8px',
  },

  Menu: {
    itemHeight: '34px',
    borderRadius: '6px',
  },

  Layout: {
    color: '#f8fafc',
    siderColor: '#ffffff',
    siderBorderColor: '#e2e8f0',
  },

  Card: {
    color: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: '12px',
  },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px' },
    },
  },
};

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#10b981',
    primaryColorHover: '#34d399',
    primaryColorPressed: '#059669',
    primaryColorSuppl: '#34d399',
    borderRadius: '8px',
    textColorBase: '#f4f4f5',
    borderColor: '#27272a',
  },

  Notification: {
    color: '#18181b',
    textColor: '#f4f4f5',
  },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px', color: '#18181b' },
    },
  },

  Menu: {
    itemHeight: '34px',
    borderRadius: '6px',
  },

  Layout: {
    color: '#09090b',
    siderColor: '#121215',
    siderBorderColor: '#27272a',
  },

  Card: {
    color: '#18181b',
    borderColor: '#27272a',
    borderRadius: '12px',
  },

  Table: {
    tdColor: '#18181b',
    thColor: '#27272a',
  },
};

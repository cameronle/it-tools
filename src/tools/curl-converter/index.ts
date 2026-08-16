import { Terminal } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.curl-converter.title', 'cURL to Code Converter'),
  path: '/curl-converter',
  description: translate('tools.curl-converter.description', 'Convert cURL commands to Python, JavaScript fetch, or Go code snippets.'),
  keywords: [
    'curl',
    'converter',
    'python',
    'javascript',
    'fetch',
    'golang',
    'request',
    'api',
    'http',
  ],
  component: () => import('./curl-converter.vue'),
  icon: Terminal,
});

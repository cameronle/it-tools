import { defineStore } from 'pinia';
import _ from 'lodash';
import type { PaletteOption } from './command-palette.types';
import { useToolStore } from '@/tools/tools.store';
import { useFuzzySearch } from '@/composable/fuzzySearch';
import { useStyleStore } from '@/stores/style.store';

import SunIcon from '~icons/mdi/white-balance-sunny';
import GithubIcon from '~icons/mdi/github';
import DiceIcon from '~icons/mdi/dice-5';
import InfoIcon from '~icons/mdi/information-outline';

const toolAliases: Record<string, string[]> = {
  'date-time-converter': ['时间戳', '时间转换', '日期转换', 'timestamp', 'epoch', 'unix'],
  'integer-base-converter': ['进制转换', '二进制', '十进制', '十六进制', 'hex', 'bin', 'oct'],
  'roman-numeral-converter': ['罗马数字', 'roman'],
  'base64-string-converter': ['base64', '转码', '编码', '解码', 'encode', 'decode'],
  'base64-file-converter': ['base64文件', '文件转base64', 'file to base64'],
  'color-converter': ['颜色转换', 'rgb', 'hex', 'hsl', 'color'],
  'case-converter': ['大小写转换', '驼峰', '下划线', 'camelCase', 'snake_case', 'kebab-case'],
  'text-to-nato-alphabet': ['北约字母表', 'nato', 'phonetic'],
  'text-to-binary': ['文本转二进制', 'text to bin'],
  'text-to-unicode': ['unicode', '字符编码'],
  'yaml-to-json-converter': ['yaml转json', 'yaml to json'],
  'json-to-yaml-converter': ['json转yaml', 'json to yaml'],
  'json-to-csv': ['json转csv', 'json to csv'],
  'xml-to-json': ['xml转json', 'xml to json'],
  'json-to-xml': ['json转xml', 'json to xml'],
  'yaml-to-toml': ['yaml转toml'],
  'json-to-toml': ['json转toml'],
  'toml-to-yaml': ['toml转yaml'],
  'toml-to-json': ['toml转json'],
  'list-converter': ['列表转换', 'list', 'sort', 'reverse'],
  'token-generator': ['随机密码', 'token生成', '随机字符', 'random token', 'password'],
  'hash-text': ['哈希计算', 'md5', 'sha1', 'sha256', 'sha512', 'hash', '散列'],
  'bcrypt': ['bcrypt', '密码哈希', 'hash password'],
  'uuid-generator': ['uuid', 'guid', '唯一ID', 'uuid v4'],
  'ulid-generator': ['ulid', '时间顺序ID'],
  'encryption': ['对称加密', 'aes', 'triple des', 'encrypt', 'decrypt'],
  'bip39-generator': ['助记词', 'bip39', 'mnemonic'],
  'hmac-generator': ['hmac', '签名计算', 'sha256 hmac'],
  'rsa-key-pair-generator': ['rsa密钥对', '公钥私钥', 'public key', 'private key'],
  'password-strength-analyser': ['密码强度', '密码检测', 'password strength'],
  'pdf-signature-checker': ['pdf签名', 'pdf验签', 'pdf verify'],
  'url-encoder': ['url编码', 'url解码', 'encodeuri', 'url decode'],
  'url-parser': ['url解析', 'query string', 'params', '网址分析'],
  'html-entities': ['html实体', 'html escape', '转义字符'],
  'url-slugify': ['slugify', 'url别名'],
  'device-information': ['设备信息', '浏览器信息', 'screen', 'device info'],
  'basic-auth-generator': ['basic auth', '基础认证', 'http auth'],
  'meta-tag-generator': ['meta标签', 'seo meta', 'og tags'],
  'otp-code-generator-and-validator': ['2fa', 'otp', 'totp', '两步验证', '验证码'],
  'mime-types': ['mime', 'content-type', '文件类型'],
  'jwt-parser': ['jwt', 'jwt解析', 'jwt验签', 'json web token'],
  'keycode-info': ['按键码', 'keycode', 'keyboard event'],
  'slugify-string': ['slug', '字符串别名', 'url slug'],
  'html-wysiwyg-editor': ['富文本编辑器', 'wysiwyg', 'html editor'],
  'user-agent-parser': ['ua解析', 'user agent', '浏览器识别'],
  'http-status-codes': ['http状态码', 'status code', '404', '500', '200'],
  'json-diff': ['json对比', 'json diff', '差异比较'],
  'json-viewer': ['json查看器', 'json格式化', 'json prettify', 'beautify'],
  'json-minify': ['json压缩', 'json minify'],
  'sql-prettify': ['sql格式化', 'sql美化', 'sql format'],
  'chmod-calculator': ['chmod', 'linux权限', '755', '777', '644'],
  'docker-run-to-docker-compose-converter': ['docker转compose', 'docker run to compose'],
  'xml-formatter': ['xml格式化', 'xml beautify'],
  'yaml-viewer': ['yaml查看器', 'yaml格式化'],
  'regex-tester': ['正则测试', '正则表达式', 'regexp', 'regex test'],
  'regex-memo': ['正则速查', '常用正则', 'regex cheatsheet'],
  'qr-code-generator': ['二维码', 'qrcode', '生成二维码'],
  'wifi-qr-code-generator': ['wifi二维码', '扫码连wifi'],
  'ipv4-subnet-calculator': ['子网掩码', 'cidr', 'ip计算', '网段划分', 'subnet'],
  'ipv4-address-converter': ['ip转换', 'ipv4进制', 'ip integer'],
  'ipv4-range-expander': ['ip范围展开', 'ip段列表'],
  'ipv6-ula-generator': ['ipv6生成', 'ula ipv6'],
  'mac-address-generator': ['mac地址生成', 'random mac'],
  'mac-address-lookup': ['mac厂商查询', 'oui lookup', 'mac vendor'],
  'random-port-generator': ['随机端口', '可用端口', 'random port'],
  'crontab-generator': ['cron表达式', 'crontab', '定时任务'],
  'text-diff': ['文本对比', '代码对比', 'diff', 'text compare'],
  'markdown-to-html': ['markdown转html', 'md to html'],
};

export const useCommandPaletteStore = defineStore('command-palette', () => {
  const toolStore = useToolStore();
  const styleStore = useStyleStore();
  const router = useRouter();
  const searchPrompt = ref('');

  const toolsOptions = computed(() => toolStore.tools.map((tool) => {
    const key = tool.path.replace(/\//g, '');
    const aliases = toolAliases[key] || [];
    return {
      ...tool,
      to: tool.path,
      toolCategory: tool.category,
      category: 'Tools',
      keywords: [...(tool.keywords || []), ...aliases, tool.name, tool.category],
    };
  }));

  const searchOptions = computed<PaletteOption[]>(() => [
    ...toolsOptions.value,
    {
      name: 'Random tool',
      description: 'Get a random tool from the list.',
      action: () => {
        const { path } = _.sample(toolStore.tools)!;
        router.push(path);
      },
      icon: DiceIcon,
      category: 'Actions',
      keywords: ['random', 'tool', 'pick', 'choose', 'select', '随机工具'],
      closeOnSelect: true,
    },
    {
      name: 'Toggle dark mode',
      description: 'Toggle dark mode on or off.',
      action: () => styleStore.toggleDark(),
      icon: SunIcon,
      category: 'Actions',
      keywords: ['dark', 'theme', 'toggle', 'mode', 'light', 'system', '暗黑模式', '深色模式', '主题切换'],
    },
    {
      name: 'Github repository',
      href: 'https://github.com/cameronle/it-tools',
      category: 'External',
      description: 'View the source code of it-tools on Github.',
      keywords: ['github', 'repo', 'repository', 'source', 'code', '源码'],
      icon: GithubIcon,
    },
    {
      name: 'About',
      description: 'Learn more about IT-Tools.',
      to: '/about',
      category: 'Pages',
      keywords: ['about', 'learn', 'more', 'info', 'information', '关于'],
      icon: InfoIcon,
    },
  ]);

  const { searchResult } = useFuzzySearch({
    search: searchPrompt,
    data: searchOptions,
    options: {
      keys: [{ name: 'name', weight: 2 }, { name: 'keywords', weight: 1.5 }, 'description', 'category'],
      threshold: 0.35,
    },
  });

  const filteredSearchResult = computed(() =>
    _.chain(searchResult.value).groupBy('category').mapValues(categoryOptions => _.take(categoryOptions, 8)).value());

  return {
    filteredSearchResult,
    searchPrompt,
  };
});

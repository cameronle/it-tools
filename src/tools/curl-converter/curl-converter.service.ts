export interface ParsedCurl {
  method: string
  url: string
  headers: Record<string, string>
  data?: string
  auth?: { user: string; pass: string }
}

export function parseCurl(curlCommand: string): ParsedCurl {
  const result: ParsedCurl = {
    method: 'GET',
    url: '',
    headers: {},
  };

  const cleanCmd = curlCommand
    .replace(/\\\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Tokenize taking quotes into account
  const tokens: string[] = [];
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  let match = regex.exec(cleanCmd);
  while (match !== null) {
    tokens.push(match[1] ?? match[2] ?? match[0]);
    match = regex.exec(cleanCmd);
  }

  let i = 0;
  if (tokens[0]?.toLowerCase() === 'curl') {
    i = 1;
  }

  while (i < tokens.length) {
    const token = tokens[i];

    if (token === '-X' || token === '--request') {
      result.method = (tokens[i + 1] || 'GET').toUpperCase();
      i += 2;
    }
    else if (token === '-H' || token === '--header') {
      const headerStr = tokens[i + 1] || '';
      const colonIdx = headerStr.indexOf(':');
      if (colonIdx > 0) {
        const key = headerStr.slice(0, colonIdx).trim();
        const val = headerStr.slice(colonIdx + 1).trim();
        result.headers[key] = val;
      }
      i += 2;
    }
    else if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary') {
      result.data = tokens[i + 1] || '';
      if (result.method === 'GET') {
        result.method = 'POST';
      }
      i += 2;
    }
    else if (token === '-u' || token === '--user') {
      const authStr = tokens[i + 1] || '';
      const colonIdx = authStr.indexOf(':');
      if (colonIdx >= 0) {
        result.auth = {
          user: authStr.slice(0, colonIdx),
          pass: authStr.slice(colonIdx + 1),
        };
      }
      else {
        result.auth = { user: authStr, pass: '' };
      }
      i += 2;
    }
    else if (token.startsWith('http://') || token.startsWith('https://')) {
      result.url = token;
      i++;
    }
    else {
      i++;
    }
  }

  return result;
}

export function toPythonRequests(parsed: ParsedCurl): string {
  const { method, url, headers, data, auth } = parsed;
  const lines: string[] = ['import requests', ''];

  if (Object.keys(headers).length > 0) {
    lines.push(`headers = ${JSON.stringify(headers, null, 4)}`);
  }

  if (data) {
    try {
      const parsedJson = JSON.parse(data);
      lines.push(`json_data = ${JSON.stringify(parsedJson, null, 4)}`);
    }
    catch (_) {
      lines.push(`data = ${JSON.stringify(data)}`);
    }
  }

  let reqCall = `response = requests.${method.toLowerCase()}('${url || 'https://api.example.com'}'`;
  if (Object.keys(headers).length > 0) {
    reqCall += ', headers=headers';
  }
  if (data) {
    try {
      JSON.parse(data);
      reqCall += ', json=json_data';
    }
    catch (_) {
      reqCall += ', data=data';
    }
  }
  if (auth) {
    reqCall += `, auth=('${auth.user}', '${auth.pass}')`;
  }
  reqCall += ')';

  lines.push('');
  lines.push(reqCall);
  lines.push('print(response.status_code)');
  lines.push('print(response.text)');

  return lines.join('\n');
}

export function toJavaScriptFetch(parsed: ParsedCurl): string {
  const { method, url, headers, data, auth } = parsed;
  const options: Record<string, any> = { method };

  const finalHeaders = { ...headers };
  if (auth) {
    const encoded = btoa(`${auth.user}:${auth.pass}`);
    finalHeaders.Authorization = `Basic ${encoded}`;
  }

  if (Object.keys(finalHeaders).length > 0) {
    options.headers = finalHeaders;
  }

  if (data && method !== 'GET' && method !== 'HEAD') {
    options.body = data;
  }

  return `const response = await fetch('${url || 'https://api.example.com'}', ${JSON.stringify(options, null, 2)});
const data = await response.json();
console.log(data);`;
}

export function toGolang(parsed: ParsedCurl): string {
  const { method, url, headers, data } = parsed;
  const lines: string[] = [
    'package main',
    '',
    'import (',
    '    "fmt"',
    '    "io"',
    '    "net/http"',
  ];

  if (data) {
    lines.push('    "strings"');
  }
  lines.push(')', '', 'func main() {');
  lines.push('    client := &http.Client{}');

  if (data) {
    lines.push(`    var data = strings.NewReader(${JSON.stringify(data)})`);
    lines.push(`    req, err := http.NewRequest("${method}", "${url || 'https://api.example.com'}", data)`);
  }
  else {
    lines.push(`    req, err := http.NewRequest("${method}", "${url || 'https://api.example.com'}", nil)`);
  }

  lines.push('    if err != nil {');
  lines.push('        panic(err)');
  lines.push('    }');

  for (const [k, v] of Object.entries(headers)) {
    lines.push(`    req.Header.Set("${k}", "${v}")`);
  }

  lines.push('    resp, err := client.Do(req)');
  lines.push('    if err != nil {');
  lines.push('        panic(err)');
  lines.push('    }');
  lines.push('    defer resp.Body.Close()');
  lines.push('    bodyText, err := io.ReadAll(resp.Body)');
  lines.push('    if err != nil {');
  lines.push('        panic(err)');
  lines.push('    }');
  lines.push('    fmt.Printf("%s\\n", bodyText)');
  lines.push('}');

  return lines.join('\n');
}

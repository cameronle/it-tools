import { describe, expect, it } from 'vitest';
import { parseCurl, toGolang, toJavaScriptFetch, toPythonRequests } from './curl-converter.service';

describe('curl-converter', () => {
  it('parses standard POST curl with JSON body', () => {
    const cmd = 'curl -X POST "https://api.example.com/users" -H "Content-Type: application/json" -H "Authorization: Bearer token123" -d \'{"name":"John","age":30}\'';
    const parsed = parseCurl(cmd);

    expect(parsed.method).toBe('POST');
    expect(parsed.url).toBe('https://api.example.com/users');
    expect(parsed.headers['Content-Type']).toBe('application/json');
    expect(parsed.headers.Authorization).toBe('Bearer token123');
    expect(parsed.data).toBe('{"name":"John","age":30}');
  });

  it('generates python code correctly', () => {
    const parsed = parseCurl('curl "https://httpbin.org/get" -H "Accept: application/json"');
    const py = toPythonRequests(parsed);
    expect(py).toContain('import requests');
    expect(py).toContain('requests.get(\'https://httpbin.org/get\'');
  });

  it('generates fetch code correctly', () => {
    const parsed = parseCurl('curl -X DELETE "https://api.example.com/item/1"');
    const js = toJavaScriptFetch(parsed);
    expect(js).toContain('fetch(\'https://api.example.com/item/1\'');
    expect(js).toContain('"method": "DELETE"');
  });

  it('generates go code correctly', () => {
    const parsed = parseCurl('curl "https://httpbin.org/get"');
    const go = toGolang(parsed);
    expect(go).toContain('package main');
    expect(go).toContain('http.NewRequest("GET"');
  });
});

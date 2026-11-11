import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const project = fileURLToPath(new URL('../', import.meta.url));
export const instance = 'https://dev309702.service-now.com';
const sdkRoot = new URL('../node_modules/@servicenow/sdk/', import.meta.url);
const sdkPackage = JSON.parse(await readFile(new URL('package.json', sdkRoot), 'utf8'));
const sdkBin = fileURLToPath(new URL(sdkPackage.bin['now-sdk'], sdkRoot));

export function command(executable, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd: options.cwd || project, env: process.env,
      stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });
    let stdout = '';
    if (options.capture) {
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', chunk => { stdout += chunk; });
      child.stderr.resume();
    }
    child.once('error', reject);
    child.once('close', code => {
      if (code === 0) resolve(stdout);
      else reject(new Error('The development command failed with exit code ' + code + '.'));
    });
  });
}

export const sdk = (args, options) => command(process.execPath, [sdkBin, ...args], options);

export async function createPdiClient() {
  if (process.env.SN_SDK_INSTANCE_URL && process.env.SN_SDK_INSTANCE_URL !== instance) {
    throw new Error('This project targets dev309702. Set the instance URL to match before continuing.');
  }
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
  if (process.env.SN_SDK_NODE_ENV === 'SN_SDK_CI_INSTALL') {
    const { SN_SDK_USER, SN_SDK_USER_PWD } = process.env;
    if (!SN_SDK_USER || !SN_SDK_USER_PWD) throw new Error('The pipeline needs its ServiceNow username and password secrets.');
    headers.Authorization = 'Basic ' + Buffer.from(SN_SDK_USER + ':' + SN_SDK_USER_PWD).toString('base64');
  } else {
    const output = await sdk(['auth', '--print', 'suiko-pdi', '--format', 'headers'], { capture: true });
    for (const line of output.split(/\r?\n/)) {
      const match = line.match(/^(Authorization|Cookie|X-UserToken):\s*(.+)$/i);
      if (match) headers[match[1]] = match[2];
    }
    if (!headers.Cookie && !headers.Authorization) throw new Error('Authenticate the suiko-pdi SDK profile first.');
  }
  return async function call(path, { method = 'GET', body, text = false } = {}) {
    if (!path.startsWith('/') || path.startsWith('//')) throw new Error('Use an instance-relative path.');
    const response = await fetch(instance + path, {
      method, headers, redirect: 'error',
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(90000),
    });
    const payload = text ? await response.text() : await response.json();
    if (!response.ok) {
      const message = payload?.result?.message || payload?.error?.message || 'HTTP ' + response.status;
      throw new Error('ServiceNow could not complete the action. ' + message);
    }
    return text ? payload : payload.result ?? payload;
  };
}

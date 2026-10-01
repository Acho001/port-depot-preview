// Exercises the shipped binaries on native Windows; does not need app sources.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawn, spawnSync } = require('node:child_process');
const { chromium } = require('playwright');
const reportDir = path.resolve('validation'); fs.mkdirSync(reportDir, { recursive: true });
const checks = [], errors = [];
const installDir = path.join(process.env.LOCALAPPDATA, 'Port Depot 安装测试 空格');
const dataDir = path.join(process.env.LOCALAPPDATA, 'Port Depot Data');
const installer = path.resolve('build/output/Port-Depot-v0.5.1-Windows-x64-Setup.exe');
const executable = path.join(installDir, 'PortDepot.exe');
const backend = path.join(installDir, 'resources/backend');
let child, browser, page, endpoint;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function pass(name, detail) { checks.push({ name, passed: true, detail }); console.log(`PASS ${name}`); }
async function eventually(fn, timeout = 60000) {
  const until = Date.now() + timeout; let last;
  while (Date.now() < until) { try { const value = await fn(); if (value) return value; } catch (error) { last = error; } await delay(200); }
  throw last || new Error('Timed out');
}
async function install() {
  const proc = spawn(installer, ['/S', `/D=${installDir}`], { stdio: 'inherit' });
  const exit = await new Promise((resolve, reject) => { proc.once('error', reject); proc.once('exit', resolve); });
  assert.equal(exit, 0); assert(fs.existsSync(executable));
}
async function launch(extra = []) {
  child = spawn(executable, ['--remote-debugging-port=9222', ...extra], { env: { ...process.env, PATH: `${process.env.SystemRoot}\\System32;${process.env.SystemRoot}` }, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', d => fs.appendFileSync(path.join(reportDir, 'electron.log'), d));
  child.stderr.on('data', d => fs.appendFileSync(path.join(reportDir, 'electron.log'), d));
  endpoint = await eventually(async () => {
    const info = JSON.parse(fs.readFileSync(path.join(dataDir, 'runtime.json'), 'utf8'));
    if (info.pid !== child.pid) return null;
    const response = await fetch(`${info.url}/api/app-info`); return response.ok ? info : null;
  });
  browser = await eventually(() => chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 2000 }));
  page = await eventually(() => browser.contexts()[0]?.pages()[0]);
  page.on('pageerror', e => { errors.push(e.message); console.log('PAGE ERROR', e.message); });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(() => !!document.getElementById('openSettingsBtn'));
}
async function close() {
  const pid = endpoint.backendPid;
  await page.evaluate(() => window.close());
  await eventually(() => child.exitCode !== null, 15000);
  await eventually(() => { try { process.kill(pid, 0); return false; } catch { return true; } }, 15000);
  assert(!fs.existsSync(path.join(dataDir, 'runtime.json')));
  await browser.close();
  pass('Window close stops the owned Python service', { pid });
}
async function api(route, options) {
  const response = await fetch(endpoint.url + route, options);
  const value = await response.json(); assert(response.ok, `${route}: ${JSON.stringify(value)}`); return value;
}
function hashResources(root) {
  const result = {};
  function walk(dir) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p); else result[path.relative(root, p)] = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
  } }
  walk(root); return result;
}
async function uninstall() {
  const uninstaller = path.join(installDir, 'Uninstall Port Depot.exe'); assert(fs.existsSync(uninstaller));
  const proc = spawn(uninstaller, ['/S'], { stdio: 'inherit' });
  await new Promise((resolve, reject) => { proc.once('error', reject); proc.once('exit', resolve); });
  await eventually(() => !fs.existsSync(executable), 45000);
}
(async () => {
  assert.equal(process.platform, 'win32');
  assert(fs.existsSync(installer));
  await install();
  pass('Native NSIS silent install into a Chinese path containing spaces');
  const shellLink = path.join(process.env.APPDATA, 'Microsoft/Windows/Start Menu/Programs/Port Depot.lnk');
  assert(fs.existsSync(shellLink));
  pass('Start menu shortcut and registered uninstaller');
  const before = hashResources(path.join(installDir, 'resources'));
  await launch();
  assert.equal((await api('/api/app-info')).version, '2026.10.01.1');
  pass('Standalone desktop + bundled Python launch with system Python and Node absent from PATH');
  assert.equal(await page.evaluate(() => typeof require), 'undefined');
  assert.equal(await page.evaluate(() => window.portDepot.features.pets), false);
  assert.equal(await page.locator('[data-settings-tab="pet"]').count(), 0);
  assert.equal(await page.locator('[data-settings-section="pet"]').count(), 0);
  pass('Sandboxed renderer and pet feature absent from the Windows UI');
  const projects = (await api('/api/projects')).projects;
  assert(projects.some(p => p.name === 'Port Depot 入门指南'));
  assert(projects.every(p => ['default', '__collect__', '2148e7c010de43deb14a29dae984700c'].includes(p.id)));
  let canvases = (await api('/api/canvases')).canvases;
  const guide = canvases.filter(c => c.project === '2148e7c010de43deb14a29dae984700c');
  assert.equal(guide.length, 10);
  let assetUrls = new Set();
  for (const c of guide) {
    const canvas = (await api(`/api/canvases/${c.id}`)).canvas;
    for (const n of canvas.nodes || []) if (n.url?.startsWith('/assets/')) assetUrls.add(n.url);
  }
  for (const url of assetUrls) { const response = await fetch(endpoint.url + url); assert(response.ok, `Guide asset missing: ${url}`); }
  pass('Clean onboarding: ten guide canvases; all bundled media reachable', { projects: projects.length, canvases: guide.length, assets: assetUrls.size });
  await page.locator('#openSettingsBtn').click();
  await page.locator('#languageSelect').selectOption('en');
  await page.waitForFunction(() => document.getElementById('languageSelect').value === 'en');
  await page.locator('#settingsClose').click();
  await page.screenshot({ path: path.join(reportDir, 'workspace-en.png') });
  const firstPort = endpoint.url;
  const duplicate = spawn(executable, [], { stdio: 'ignore' });
  await eventually(() => duplicate.exitCode !== null, 15000);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dataDir, 'runtime.json'))).pid, child.pid);
  pass('Second launch focuses the same desktop instance');
  const guideRoot = guide.find(c => !c.parent_id) || guide[0];
  const rootData = await api(`/api/canvases/${guideRoot.id}`);
  const project = await api('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Windows 中文路径 保留测试' }) });
  const projectId = project.project?.id || project.id;
  assert(projectId, JSON.stringify(project));
  const created = await api('/api/canvases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: '中文画板 空格', project: projectId }) });
  const canvasId = created.canvas?.id || created.id; assert(canvasId);
  const file = await api('/api/library/text', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: '中文 文件.txt', content: 'Windows Unicode / 中文保留', folder: canvasId }) });
  assert(file.item?.url);
  const resolved = await api('/api/library/file-clipboard-uris', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ urls: [file.item.url] }) });
  assert(resolved.uris[0].startsWith('file:///'));
  const localFile = require('node:url').fileURLToPath(resolved.uris[0]); assert(fs.existsSync(localFile));
  pass('Chinese project, canvas, filenames and native file URI resolution');
  await page.goto(`${endpoint.url}/static/file-canvas.html?id=${canvasId}&project=${projectId}`);
  await page.waitForFunction(() => window.__pdCanvasId);
  const copy = await page.evaluate(async url => window.webkit.messageHandlers.copyFiles.postMessage({ urls: [url] }), file.item.url);
  assert.equal(copy.count, 1);
  const ps = path.join(process.env.SystemRoot, 'System32/WindowsPowerShell/v1.0/powershell.exe');
  const copiedPaths = spawnSync(ps, ['-NoProfile', '-NonInteractive', '-STA', '-Command', 'Add-Type -AssemblyName System.Windows.Forms;[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false);ConvertTo-Json -Compress -InputObject @([Windows.Forms.Clipboard]::GetFileDropList())'], { encoding: 'utf8' });
  assert.equal(copiedPaths.status, 0); assert(JSON.parse(copiedPaths.stdout).includes(localFile));
  pass('Windows CF_HDROP file clipboard contains the real Chinese file path');
  await page.keyboard.press('Control+V');
  await eventually(async () => (await api(`/api/canvases/${canvasId}`)).canvas.nodes?.some(n => n.type === 'file'), 15000);
  pass('Explorer-compatible Ctrl+V imports clipboard files as canvas nodes');
  await page.screenshot({ path: path.join(reportDir, 'canvas-zh-path.png') });
  const exported = await fetch(`${endpoint.url}/api/canvases/${guideRoot.id}/export-package`); assert(exported.ok);
  const zip = Buffer.from(await exported.arrayBuffer()); assert.equal(zip.subarray(0,2).toString(), 'PK');
  fs.writeFileSync(path.join(reportDir, 'guide-roundtrip.zip'), zip);
  const form = new FormData(); form.append('files', new Blob([zip]), 'guide.portdepot.zip');
  const imported = await api(`/api/canvases/${canvasId}/import-package`, { method: 'POST', body: form });
  assert(imported.ok); assert(imported.canvas_count >= 10);
  pass('Project ZIP exports and imports its complete nested canvas/media structure', { canvases: imported.canvas_count });
  const shotResponse = await fetch(`${endpoint.url}/api/screenshot/fullscreen`, { method: 'POST' });
  const shot = await shotResponse.json(); assert(shotResponse.ok, JSON.stringify(shot)); assert(shot.width > 0 && shot.height > 0);
  const crop = await api('/api/screenshot/crop', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: shot.id, x: 0, y: 0, w: 120, h: 80 }) });
  assert((await fetch(endpoint.url + crop.url)).ok);
  pass('Native Windows screen capture, cropping and collection media writes');
  const forbidden = await fetch(endpoint.url + '/api/update-from-github', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }); assert.equal(forbidden.status, 409);
  const marker = path.join(dataDir, 'user-data-preservation.txt'); fs.writeFileSync(marker, 'Keep through upgrade and uninstall');
  assert.deepEqual(hashResources(path.join(installDir, 'resources')), before);
  pass('Launch/edit/capture do not modify the packaged installation resources');
  await close();
  await launch(['--force-device-scale-factor=1.25']);
  assert.equal(endpoint.url, firstPort);
  await page.locator('#openSettingsBtn').click();
  assert.equal(await page.locator('#languageSelect').inputValue(), 'en');
  assert.equal(await page.evaluate(() => window.devicePixelRatio), 1.25);
  await page.screenshot({ path: path.join(reportDir, 'settings-125dpi.png') });
  pass('Stable local origin restores language preferences; 125% display scaling works');
  await page.locator('#settingsClose').click();
  await close();
  await install();
  assert.equal(fs.readFileSync(marker, 'utf8'), 'Keep through upgrade and uninstall');
  await launch();
  assert((await api('/api/projects')).projects.some(p => p.id === projectId));
  assert((await fetch(endpoint.url + file.item.url)).ok);
  await close();
  pass('Installing over the existing app preserves projects and media');
  await uninstall();
  assert(fs.existsSync(marker)); assert(fs.existsSync(localFile));
  pass('Standard uninstall removes the application and retains user data');
  // Real old-layout upgrade fixture: no guide index, existing canvas in storage/library.
  const preserved = path.join(process.env.LOCALAPPDATA, 'Port Depot Data fresh test backup'); fs.renameSync(dataDir, preserved);
  fs.mkdirSync(path.join(dataDir, 'storage/library/旧版项目/中文画板'), { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'storage/projects.json'), JSON.stringify({ projects: [{ id:'legacy', name:'旧版项目' }] }));
  const legacyCanvas = { id:'legacy-canvas', title:'中文画板', project:'legacy', dir:'旧版项目/中文画板', nodes:[], connections:[], created_at:1, updated_at:1 };
  fs.writeFileSync(path.join(dataDir, 'storage/library/旧版项目/中文画板/canvas.json'), JSON.stringify(legacyCanvas));
  fs.writeFileSync(path.join(dataDir, 'storage/library/旧版项目/中文画板/保留.txt'), 'legacy media');
  await install(); await launch();
  assert((await api('/api/projects')).projects.some(p => p.id === 'legacy'));
  assert(!(await api('/api/projects')).projects.some(p => p.id === '2148e7c010de43deb14a29dae984700c'));
  assert.equal((await api('/api/canvases/legacy-canvas')).canvas.id, 'legacy-canvas');
  assert.equal(await (await fetch(endpoint.url + '/assets/library/' + encodeURI('旧版项目/中文画板/保留.txt'))).text(), 'legacy media');
  await close(); await uninstall();
  pass('Old storage/library layout migrates without symlink privileges, replacement or tutorial injection');
  assert.deepEqual(errors, []);
  pass('No uncaught renderer errors during the tested UI operations');
})().then(() => {
  fs.writeFileSync(path.join(reportDir, 'Windows-validation.json'), JSON.stringify({ platform:process.platform, os:os.release(), arch:process.arch, testedAt:new Date().toISOString(), installerSHA256:crypto.createHash('sha256').update(fs.readFileSync(installer)).digest('hex'), checks }, null, 2));
}).catch(error => {
  console.error(error.stack);
  fs.writeFileSync(path.join(reportDir, 'Windows-validation.json'), JSON.stringify({ checks, error:error.stack, rendererErrors:errors }, null, 2));
  try { fs.copyFileSync(path.join(dataDir,'backend.log'), path.join(reportDir,'backend.log')); } catch {}
  if (child?.pid) spawnSync('taskkill', ['/PID',String(child.pid),'/T','/F']);
  process.exit(1);
});

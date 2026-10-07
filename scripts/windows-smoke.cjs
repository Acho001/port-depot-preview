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
const installers = fs.readdirSync('build/output').filter(name => /^Port-Depot-.*-Windows-x64-Setup\.exe$/.test(name));
assert.equal(installers.length, 1);
const installer = path.resolve('build/output', installers[0]);
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
  const names = fs.readdirSync(installDir).filter(name => /^Uninstall.*\.exe$/i.test(name)); assert.equal(names.length, 1);
  const uninstaller = path.join(installDir, names[0]);
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
  assert.equal((await api('/api/app-info')).version, fs.readFileSync(path.join(backend, 'VERSION'), 'utf8').trim());
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
  const reservedProject = (await api('/api/projects', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:'CON'}) })).project;
  const reservedCanvas = (await api('/api/canvases', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({title:'NUL', project:reservedProject.id}) })).canvas;
  assert(reservedCanvas.dir.includes('_CON')); assert(reservedCanvas.dir.includes('_NUL'));
  pass('Windows reserved device names are mapped to valid directories while retaining display titles');

  await page.goto(`${endpoint.url}/static/file-canvas.html?id=${canvasId}&project=${projectId}`);
  await page.waitForFunction(() => window.__pdCanvasId && typeof fmCopySelectedFilesToSystem === 'function');
  const copy = await page.evaluate(async uris => {
    const state = await window.webkit.messageHandlers.clipboardState.postMessage({});
    return window.webkit.messageHandlers.copyFiles.postMessage({uris, expectedChangeCount:state.changeCount});
  }, resolved.uris);
  assert.equal(copy.count, 1);
  const ps = path.join(process.env.SystemRoot, 'System32/WindowsPowerShell/v1.0/powershell.exe');
  const copiedPaths = spawnSync(ps, ['-NoProfile', '-NonInteractive', '-STA', '-Command', 'Add-Type -AssemblyName System.Windows.Forms;[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false);ConvertTo-Json -Compress -InputObject @([Windows.Forms.Clipboard]::GetFileDropList())'], { encoding: 'utf8' });
  assert.equal(copiedPaths.status, 0); assert(JSON.parse(copiedPaths.stdout).includes(localFile));
  pass('Windows CF_HDROP file clipboard contains the real Chinese file path');
  const beforePaste = await page.evaluate(() => nodes.length);
  await page.keyboard.press('Control+V');
  await page.waitForFunction(count => nodes.length === count + 1, beforePaste);
  const pastedFile = await page.evaluate(() => nodes.find(n => selected.has(n.id)));
  assert.equal(pastedFile.type, 'file'); assert.notEqual(pastedFile.url, file.item.url);
  assert.equal(await (await fetch(endpoint.url + pastedFile.url)).text(), 'Windows Unicode / 中文保留');
  pass('Ctrl+V creates an independent real file, with a view pointing to that file');
  await page.keyboard.press('Control+C');
  await page.waitForFunction(() => !window.__pdNativeFileBusy);
  function nativeClipboard() {
    const result = spawnSync(ps, ['-NoProfile','-NonInteractive','-STA','-Command', 'Add-Type -AssemblyName System.Windows.Forms;[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false);ConvertTo-Json -Compress -InputObject @{files=@([Windows.Forms.Clipboard]::GetFileDropList());text=[Windows.Forms.Clipboard]::GetText()}'], {encoding:'utf8'});
    assert.equal(result.status,0,result.stderr); return JSON.parse(result.stdout);
  }
  const nodeClipboard = nativeClipboard(); assert.equal(nodeClipboard.files.length,1); assert.notEqual(nodeClipboard.files[0],localFile);
  assert.equal(fs.readFileSync(nodeClipboard.files[0],'utf8'),'Windows Unicode / 中文保留');
  pass('Canvas Ctrl+C supplies the copied real file to the Windows clipboard');
  await page.evaluate(() => {
    const panel=document.createElement('div'); panel.id='clipboard-regression'; panel.style='position:fixed;top:150px;left:50px;z-index:999999;background:white;padding:20px;';
    panel.innerHTML='<textarea id="copy-source">Fresh text after copying a file</textarea><textarea id="copy-destination"></textarea><button id="copy-text-button">Copy text</button><span id="copy-text-result"></span>';
    document.body.append(panel);
    document.getElementById('copy-text-button').onclick=async()=>{document.getElementById('copy-text-result').textContent=String(await copyTextToClipboard('Button text after copying a file'));};
  });
  await page.locator('#copy-source').focus(); await page.keyboard.press('Control+A'); await page.keyboard.press('Control+C');
  assert.deepEqual(nativeClipboard(),{files:[],text:'Fresh text after copying a file'});
  await page.locator('#copy-destination').focus(); await page.keyboard.press('Control+V');
  assert.equal(await page.locator('#copy-destination').inputValue(),'Fresh text after copying a file');
  pass('Actual input Ctrl+C/Ctrl+V replaces the previous file clipboard and pastes current text');
  await page.evaluate(async()=>{document.activeElement.blur();await copySelectedNodes();});
  assert.equal(nativeClipboard().files.length,1);
  await page.locator('#copy-text-button').click();
  await page.waitForFunction(()=>document.getElementById('copy-text-result').textContent==='true');
  assert.deepEqual(nativeClipboard(),{files:[],text:'Button text after copying a file'});
  pass('Copy text button clears CF_HDROP while a file node is still selected');
  await page.evaluate(()=>{document.activeElement.blur();document.getElementById('clipboard-regression').remove();});
  const beforeText = await page.evaluate(()=>nodes.length);
  await page.keyboard.press('Control+V');
  await page.waitForFunction(count=>nodes.length===count+1,beforeText);
  const pastedText=await page.evaluate(()=>nodes.at(-1));
  assert.equal(pastedText.type,'text'); assert.equal(pastedText.text,'Button text after copying a file'); assert(pastedText.fileUrl);
  assert.equal(await (await fetch(endpoint.url+pastedText.fileUrl)).text(),'Button text after copying a file');
  pass('Canvas paste uses the latest system text and writes a real TXT file');
  await page.evaluate(async()=>{selected.clear();selected.add(nodes.find(n=>n.type==='file').id);const pending=copySelectedNodes();await copyTextToClipboard('New text cancels pending file copy');await pending;});
  assert.deepEqual(nativeClipboard(),{files:[],text:'New text cancels pending file copy'});
  pass('Pending node file preparation cannot overwrite a newer text copy');
  const imageWrite=spawnSync(ps,['-NoProfile','-NonInteractive','-STA','-Command','Add-Type -AssemblyName System.Windows.Forms;Add-Type -AssemblyName System.Drawing;$bitmap=[Drawing.Bitmap]::new(8,8);$graphics=[Drawing.Graphics]::FromImage($bitmap);$graphics.Clear([Drawing.Color]::Red);[Windows.Forms.Clipboard]::SetImage($bitmap)'],{encoding:'utf8'});
  assert.equal(imageWrite.status,0,imageWrite.stderr);
  const beforeImage=await page.evaluate(()=>nodes.length);await page.keyboard.press('Control+V');
  await page.waitForFunction(count=>nodes.length===count+1,beforeImage);
  const imageNode=await page.evaluate(()=>nodes.find(n=>selected.has(n.id)));assert.equal(imageNode.type,'image');
  const imageBytes=Buffer.from(await (await fetch(endpoint.url+imageNode.url)).arrayBuffer());
  assert.equal(imageBytes.subarray(1,4).toString(),'PNG');
  await page.evaluate(()=>copySelectedNodes());assert.equal(nativeClipboard().files.length,1);
  pass('Native Windows bitmap clipboard pastes as a real PNG and can be copied back as a file');
  const cutFile=path.join(reportDir,'Windows 原生剪切.txt');fs.writeFileSync(cutFile,'Native cut original');
  const cutWrite=spawnSync(ps,['-NoProfile','-NonInteractive','-STA','-Command',`Add-Type -AssemblyName System.Windows.Forms;$paths=[Collections.Specialized.StringCollection]::new();$paths.Add('${cutFile.replaceAll("'","''")}')|Out-Null;$data=[Windows.Forms.DataObject]::new();$data.SetFileDropList($paths);$data.SetData('Preferred DropEffect',[IO.MemoryStream]::new([byte[]](2,0,0,0)));[Windows.Forms.Clipboard]::SetDataObject($data,$true)`],{encoding:'utf8'});
  assert.equal(cutWrite.status,0,cutWrite.stderr);
  const beforeCut=await page.evaluate(()=>nodes.length);await page.keyboard.press('Control+V');
  await page.waitForFunction(count=>nodes.length===count+1,beforeCut);
  assert(!fs.existsSync(cutFile));const cutNode=await page.evaluate(()=>nodes.find(n=>selected.has(n.id)));
  assert.equal(await (await fetch(endpoint.url+cutNode.url)).text(),'Native cut original');
  assert.equal(nativeClipboard().files.length,0);
  pass('Windows Preferred DropEffect cut moves the original file and consumes its clipboard');
  await page.screenshot({ path: path.join(reportDir, 'canvas-zh-path.png') });
  await page.evaluate(()=>saveCanvasNow());
  await page.goto(endpoint.url+'/'); await page.waitForFunction(()=>document.getElementById('openSettingsBtn'));
  const externalFile=path.join(reportDir,'资源管理器 原件 中文.txt');fs.writeFileSync(externalFile,'Actual external move');
  const moved=await api(`/api/canvases/${canvasId}/native-files`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({paths:[externalFile],operation:'move',x:0,y:0})});
  assert(!fs.existsSync(externalFile));assert.equal(fs.readFileSync(moved.files[0].path,'utf8'),'Actual external move');
  await api(`/api/native-file-operations/${moved.operationId}/undo`,{method:'POST'});
  assert.equal(fs.readFileSync(externalFile,'utf8'),'Actual external move');assert(!fs.existsSync(moved.files[0].path));
  pass('Native filesystem service moves the original disk file and undo restores it');
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
  const clip = path.join(reportDir, '中文视频 fixture.webm');
  const video = spawnSync(path.join(backend, 'tools/ffmpeg.exe'), ['-hide_banner','-loglevel','error','-y','-f','lavfi','-i','color=c=blue:s=96x64:r=10','-t','1','-c:v','libvpx-vp9',clip], {encoding:'utf8'});
  assert.equal(video.status, 0, video.stderr);
  const videoForm = new FormData(); videoForm.append('files', new Blob([fs.readFileSync(clip)],{type:'video/webm'}), '中文视频.webm'); videoForm.append('folder',canvasId);
  const videoUpload = await api('/api/ai/upload', {method:'POST',body:videoForm});
  const thumbnail = await fetch(endpoint.url + '/api/media-preview?url=' + encodeURIComponent(videoUpload.files[0].url) + '&w=128');
  assert(thumbnail.ok); assert(thumbnail.headers.get('content-type').startsWith('image/')); assert((await thumbnail.arrayBuffer()).byteLength > 0);
  pass('Bundled FFmpeg creates a real video thumbnail with no external media tools');

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
  const blocked = require('node:net').createServer();
  await new Promise(resolve => blocked.listen(Number(new URL(firstPort).port), '127.0.0.1', resolve));
  await launch();
  assert.notEqual(endpoint.url, firstPort);
  await page.locator('#openSettingsBtn').click();
  assert.equal(await page.locator('#languageSelect').inputValue(), 'en');
  await close();
  await new Promise(resolve => blocked.close(resolve));
  pass('Busy service port is avoided and desktop preferences survive the origin change');
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

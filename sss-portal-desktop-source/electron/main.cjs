const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

// একটি সময়ে শুধু একটি উইন্ডো চালু থাকবে
if (!app.requestSingleInstanceLock()) app.quit();

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1366, height: 850, minWidth: 1024, minHeight: 650,
    title: 'SSS Chattogram-02 Zone Employee Portal',
    backgroundColor: '#ffffff',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  // mailto: ও বাইরের লিংক ডিফল্ট ব্রাউজার/মেইল অ্যাপে খুলবে
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) { e.preventDefault(); shell.openExternal(url); }
  });
}
app.whenReady().then(createWindow);
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.on('window-all-closed', () => app.quit());

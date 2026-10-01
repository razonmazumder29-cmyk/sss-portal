const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 650,
    title: 'SSS Chattogram-02 Zone Staff Portal',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  Menu.setApplicationMenu(null);
  win.maximize();
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  // বাইরের লিংক (যেমন Gmail/Outlook) ডিফল্ট ব্রাউজারে খুলবে
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^(https?|mailto):/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
}

// একই সময়ে শুধু একটি উইন্ডো চলবে
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.whenReady().then(createWindow);
  app.on('window-all-closed', () => app.quit());
}

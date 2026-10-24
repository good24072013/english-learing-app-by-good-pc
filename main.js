const { app, BrowserWindow, shell, session, Menu } = require('electron');

const APP_URL = 'https://english-learing-app-by-good.netlify.app';
const APP_ORIGIN = new URL(APP_URL).origin;

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let win;

function errorPage() {
  const html = `<!doctype html><html><body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#020617;color:#fff;font-family:Segoe UI,Arial,sans-serif;text-align:center">
  <div><h2>Internet bağlantısı yoxdur</h2>
  <p>Bağlantını yoxlayın və yenidən cəhd edin.</p>
  <button onclick="location.href='${APP_URL}'" style="padding:10px 24px;font-size:16px;border:0;border-radius:8px;background:#1d4ed8;color:#fff;cursor:pointer">Yenidən cəhd et</button></div>
  </body></html>`;
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 480,
    minHeight: 600,
    title: 'English Learning App',
    backgroundColor: '#020617',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });

  win.loadURL(APP_URL);

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (isMainFrame && errorCode !== -3) {
      win.loadURL(errorPage());
    }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(APP_ORIGIN)) return { action: 'allow' };
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(APP_ORIGIN) && !url.startsWith('data:')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);

  // Mikrofon (Speaking tapşırığı) üçün icazə
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(['media', 'fullscreen', 'clipboard-sanitized-write'].includes(permission));
  });
  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    return ['media', 'fullscreen', 'clipboard-sanitized-write'].includes(permission);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

import './app/utils/streamPrototypeExtensions';

import { app, BrowserWindow, Menu, shell, ipcMain, globalShortcut } from 'electron';

import { download } from 'electron-dl';
// require('electron-dl')();

import Immutable from 'immutable';

import { electronDebug } from 'electron-debug';

import log from './app/utils/streamLog';

let menu;
let template;
let mainWindow = null;

import most from 'most';


import Subject from './app/utils/subject';

import transit from 'transit-immutable-js';


const state$ = Subject();


process.on('uncaughtException', function (err) {
  console.error(err);
  console.log('Node NOT Exiting...');
});


if (process.env.NODE_ENV === 'development') {
  require('electron-debug')(); // eslint-disable-line global-require
}


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


const installExtensions = async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS'
    ];
    // console.log("installer", installer);
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    for (const name of extensions) {
      try {
        await installer.default(installer[name], forceDownload);
      } catch (e) { console.error("extension install error", name, e); } // eslint-disable-line
    }
  }
};




const onTopDefinition = ['ctrl+shift+v', function () {
  // console.log('ctrl+shift+v is pressed');
  mainWindow.setAlwaysOnTop(!mainWindow.isAlwaysOnTop());
  if (!mainWindow.isAlwaysOnTop())
    mainWindow.hide();
  else
    mainWindow.show();
}];

// app.commandLine.appendSwitch('remote-debugging-port', '9222');

import Positioner from 'electron-positioner';
const osVersion = require('os').release();
const osPlatform = require('os').platform();
const supportsVibrancy = osPlatform === 'darwin' && parseInt(osVersion.split('.')[0]) >= 14;
app.on('ready', async () => {
  await installExtensions();
  const windowOpts = {
    width: 300,
    height: 500,
    transparent: supportsVibrancy,
    alwaysOnTop: true,
    frame: false,
    resizable: true,
    // titleBarStyle: 'hidden',
    // titleBarStyle:"hidden-inset",
    'min-width': 151,
    'min-height': 126,
    // 'standard-window': false,
    // 'use-content-size': true,
    // experimentalFeatures: true,    
    // Boolean - Allow an https page to display content like images from http URLs. Default is `false`. 
    allowDisplayingInsecureContent: true,
    // Boolean - Allow a https page to run JavaScript, CSS or plugins from http URLs. Default is `false`. 
    allowRunningInsecureContent: true,
    // experimentalCanvasFeatures:true,
    // overlayFullscreenVideo:true,
    darkTheme: true,
    // mobable:true,
    // zoomFactor:0.2,
    title: 'VoodoohopLiveTools',
    vibrancy: supportsVibrancy ? 'ultra-dark' : undefined,
    backgroundColor: supportsVibrancy ? undefined : 'black'
  };

  mainWindow = new BrowserWindow(windowOpts);

  mainWindow.loadURL(`file://${__dirname}/app/app.html?supportsVibrancy=${supportsVibrancy ? 1 : 0}`);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.focus();
  });
  // mainWindow.setIgnoreMouseEvents(true)
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (process.env.NODE_ENV === 'development') {
    // mainWindow.openDevTools();
    mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([{
        label: 'Inspect element',
        click() {
          mainWindow.inspectElement(x, y);
        }
      }]).popup(mainWindow);
    });
  }


  const ret = globalShortcut.register(...onTopDefinition);

  if (!ret) {
    console.error('global shortcut registration failed');
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
    app.quit();
  });

  // TODO: mostify this§

  let prevAspectRatio = 0;
  // let inFullscreen = false;
  mainWindow.on('enter-full-screen', () => {
    console.log("enter-full-screen");
    // prevAspectRatio = mainWindow.getAspectRatio();
    mainWindow.setAspectRatio(0);
    // inFullscreen = true;
  });

  mainWindow.on('leave-full-screen', () => {
    console.log("leave-full-screen");
    mainWindow.setAspectRatio(prevAspectRatio);
    // inFullscreen = false;
  });

  // const enterFullScreen$ = most.fromEvent('enter-full-screen', mainWindow);
  // const exitFullScreen$ = most.fromEvent('exit-full-screen', mainWindow);

  // const duringNotFullScreen$ = exitFullScreen$.constant(enterFullScreen$).startWith(enterFullScreen$);

  state$
    .skipImmRepeats()
    .tap(s => console.log('stateFromRenderer', s.toJS()))
    .map(s => s.get('visible'))
    .skipImmRepeats()
    // .tap(log("visibility"))
    .tap(v => mainWindow.setAlwaysOnTop(v))
    .observe(visibility => visibility ? mainWindow.show() : mainWindow.hide())
    .catch(e => console.error(e));

  state$
    .map(s => s.get('componentHeight'))
    .skipImmRepeats()
    .filter(h => h > 0)
    .debounce(300)
    .map(h => h + 20)
    .skipImmRepeats()
    // .during(duringNotFullScreen$)
    .observe(height => {
      const isFullScreen = mainWindow.isFullScreen();
      console.log("isFullScreen", isFullScreen);
      if (!isFullScreen) {
        prevAspectRatio = mainWindow.getSize()[0] / height;
        mainWindow.setAspectRatio(prevAspectRatio);
        mainWindow.setSize(mainWindow.getSize()[0], height, true);
      }
    });
  // app on ready 

  // debugWindow.on() 
  // if (process.env.NODE_ENV === 'development') {
  //   mainWindow.openDevTools();
  // }

  if (process.platform === 'darwin') {
    template = [{
      label: 'VOODOOHOP',
      submenu: [{
        label: 'About Voodoohop Live Tools',
        selector: 'orderFrontStandardAboutPanel:'
      }, {
        type: 'separator'
      }, {
        label: 'Services',
        submenu: []
      }, {
        type: 'separator'
      }, {
        label: 'Hide',
        accelerator: 'Command+H',
        selector: 'hide:'
      }, {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        selector: 'hideOtherApplications:'
      }, {
        label: 'Show All',
        selector: 'unhideAllApplications:'
      }, {
        type: 'separator'
      }, {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() {
          app.quit();
        }
      }]
    },

    {
      label: 'View',
      submenu: [{
        label: 'On Top',
        accelerator: onTopDefinition[0],
        click: onTopDefinition[1]
      }, {
        label: 'Reload',
        accelerator: 'Command+R',
        click() {
          mainWindow.reload();
        }
      }, {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }, {
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+Command+I',
        click() {
          mainWindow.toggleDevTools();
        }
      }]
    }];

    menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  } else {
    template = [{
      label: '&File',
      submenu: [{
        label: '&Open',
        accelerator: 'Ctrl+O'
      }, {
        label: '&Close',
        accelerator: 'Ctrl+W',
        click() {
          mainWindow.close();
        }
      }]
    }, {
      label: '&View',
      submenu: [{
        label: '&Reload',
        accelerator: 'Ctrl+R',
        click() {
          mainWindow.webContents.reload();
        }
      }, {
        label: 'Toggle &Full Screen',
        accelerator: 'F11',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }, {
        label: 'Toggle &Developer Tools',
        accelerator: 'Alt+Ctrl+I',
        click() {
          mainWindow.toggleDevTools();
        }
      }]
    }, {
      label: 'Help',
      submenu: [{
        label: 'Learn More',
        click() {
          shell.openExternal('http://electron.atom.io');
        }
      }, {
        label: 'Documentation',
        click() {
          shell.openExternal('https://github.com/atom/electron/tree/master/docs#readme');
        }
      }, {
        label: 'Community Discussions',
        click() {
          shell.openExternal('https://discuss.atom.io/c/electron');
        }
      }, {
        label: 'Search Issues',
        click() {
          shell.openExternal('https://github.com/atom/electron/issues');
        }
      }]
    }];
    menu = Menu.buildFromTemplate(template);
    mainWindow.setMenu(menu);



    const positioner = new Positioner(mainWindow);

    // Moves the window top right on the screen.
    positioner.move('bottomLeft');


  }
  // client.create(mainWindow);

  electronDebug({
    showDevTools: true
  });

});

ipcMain.on('dragStart', (event, { maxForLiveDevice, path, icon }) => {
  console.log('dragStart', maxForLiveDevice, path, icon);
  event.sender.startDrag({
    file: path, icon: icon
  })
});



ipcMain.on('downloadUpdate', (e, args) => {
  console.log('download update requested', args);
  e.sender.send('downloadUpdateRes', { start: true });
  download(mainWindow, args.url)
    .then(dl => {
      e.sender.send('downloadUpdateRes', { result: dl.getSavePath() })
      shell.showItemInFolder(dl.getSavePath());
      shell.beep();
      setTimeout(() => {
        mainWindow = null;
        app.quit();
      }
        , 1000);
    })
    .catch(err => e.sender.send('downloadUpdateRes', {
      error: err
    }))
});

ipcMain.on('state', (event, s) => {
  const stateUnserialized = transit.fromJSON(s);
  console.log('state length in serialized chars', s.length);
  // console.log("got state from renderer", stateUnserialized);
  state$.push(stateUnserialized);
});


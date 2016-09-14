import { app, BrowserWindow, Menu, shell,ipcMain, globalShortcut } from 'electron';


import electronDebug from 'electron-debug';

let menu;
let template;
let mainWindow = null;

import most from "most";


process.on('uncaughtException', function (err) {
  console.error(err);
  console.log("Node NOT Exiting...");
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
      'REDUX_DEVTOOLS',
      'IMMUTABLE_DEVTOOLS'
    ];
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    for (const name of extensions) {
      try {
        await installer.default(installer[name], forceDownload);
      } catch (e) {} // eslint-disable-line
    }
  }
};




const onTopDefinition=['ctrl+shift+v', function() {
    // console.log('ctrl+shift+v is pressed');
    mainWindow.setAlwaysOnTop(!mainWindow.isAlwaysOnTop());
    if (!mainWindow.isAlwaysOnTop())
      mainWindow.hide();
    else
      mainWindow.show();  
  }];

app.commandLine.appendSwitch('remote-debugging-port', '9222'); 

import Positioner from "electron-positioner";

app.on('ready', async () => {
    await installExtensions();
  mainWindow = new BrowserWindow({ 
    width: 300, 
    height: 500, 
    // transparent:true, 
    alwaysOnTop:true,
    frame: false,
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
    title:"VoodoohopLiveTools",
    backgroundColor: 'rgba(0,0,0,1)'
    });

  mainWindow.loadURL(`file://${__dirname}/app/app.html`);

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

  mainWindow.on('closed', function() {
    mainWindow = null;
    app.quit();
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
        label: 'About ElectronReact',
        selector: 'orderFrontStandardAboutPanel:'
      }, {
        type: 'separator'
      }, {
        label: 'Services',
        submenu: []
      }, {
        type: 'separator'
      }, {
        label: 'Hide ElectronReact',
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
      },{
        label: 'Reload',
        accelerator: 'Command+R',
        click() {
          mainWindow.restart();
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
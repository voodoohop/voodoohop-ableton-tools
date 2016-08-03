// var njstrace = require('njstrace').inject();


/* eslint no-path-concat: 0, func-names:0 */

var app = require('electron').app;
var BrowserWindow = require('electron').BrowserWindow;
var Menu = require('electron').Menu;
var menu;
var template;
var most = require("most");

//var process=require("electron").process;

process.on('uncaughtException', function (err) {
  console.error(err);
  console.log("Node NOT Exiting...");
});

require('electron-debug')();

// require('crash-reporter').start({companyName:"voodoohop"});
var electron=require("electron");
console.log("app",electron);
electron.app = app;

var mainWindow = null;
var debugWindow = null;


const ipcMain = require('electron').ipcMain;

ipcMain.on("stateUpdate", (err ,state) => {
 //console.log("stateUpdate",state);
    debugWindow && debugWindow.webContents.send("stateUpdate",state)
}
)

const onTopShortCut = electron.globalShortcut;
const onTopDefinition=['ctrl+shift+v',function() {
    // console.log('ctrl+shift+v is pressed');
    mainWindow.setAlwaysOnTop(!mainWindow.isAlwaysOnTop());
    if (!mainWindow.isAlwaysOnTop())
      mainWindow.hide();
    else
      mainWindow.show();  
  }];

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') 
  app.quit();
});

app.commandLine.appendSwitch('remote-debugging-port', '9222');    
var Positioner = require("electron-positioner");
app.on('ready', function() {
    //    BrowserWindow.addDevToolsExtension('node_modules/remotedev-extension/dist');
    
//  BrowserWindow.addDevToolsExtension('node_modules/storyboard/chromeExtension');
  
  
    var ret = onTopShortCut.register(...onTopDefinition);

  if (!ret) {
    console.error('global shortcut registration failed');
  }
  
  mainWindow = new BrowserWindow({ width: 300, height: 500, 
    // transparent:true, 
    alwaysOnTop:true,
    // frame: false,
	  titleBarStyle:"hidden",
		'min-width': 151,
		'min-height': 126,
		// 'standard-window': false,
		'use-content-size': true,
    // experimentalFeatures: true,
    
    // Boolean - Allow an https page to display content like images from http URLs. Default is `false`. 
    allowDisplayingInsecureContent: true,
 
    // Boolean - Allow a https page to run JavaScript, CSS or plugins from http URLs. Default is `false`. 
    allowRunningInsecureContent: true,
    // experimentalCanvasFeatures:true,
    // overlayFullscreenVideo:true,
      darkTheme: true,

    // zoomFactor:1
    title:"VOODOOHOPDJTools"
    });
    
    // window.mainWindow = mainWindow;
    //, transparent:true,frame:false });
    
var positioner = new Positioner(mainWindow);

// Moves the window top right on the screen.
positioner.move('bottomLeft');

  console.log("hey");
  mainWindow.webContents.on('did-finish-load', function() {
     
     
     
    //  new taglib.File(f[0]).readTaglibMetadata(
    //  setInterval(() =>
    //  ipcs.write("heyyy"),500);
  })
  if (false && process.env.NODE_ENV!=="production")
     debugWindow = new BrowserWindow(
         { width:600, height:600, frame:true, title:"Debug",transparent:true });

  if (process.env.HOT) {
    mainWindow.loadURL('file://' + __dirname + '/app/hot-dev-app.html');
    // mainWindow.toggleDevTools(true);
    if (debugWindow)
    setTimeout(()=> {
     debugWindow.loadURL('file://' + __dirname+ '/app/debug.html');
    //  
    //  debugWindow.toggleDevTools(true);

    }
    ,5);
  } else {
    mainWindow.loadURL('file://' + __dirname + '/app/app.html');
  }
    console.log("mainwin",mainWindow.show,mainWindow.minimized,mainWindow.minimize);;
console.log(mainWindow.prototype  );
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
        click: function() {
          app.quit();
        }
      }]
    }, 
    // {
    //   label: 'Edit',
    //   submenu: [{
    //     label: 'Undo',
    //     accelerator: 'Command+Z',
    //     selector: 'undo:'
    //   }, {
    //     label: 'Redo',
    //     accelerator: 'Shift+Command+Z',
    //     selector: 'redo:'
    //   }, {
    //     type: 'separator'
    //   }, {
    //     label: 'Cut',
    //     accelerator: 'Command+X',
    //     selector: 'cut:'
    //   }, {
    //     label: 'Copy',
    //     accelerator: 'Command+C',
    //     selector: 'copy:'
    //   }, {
    //     label: 'Paste',
    //     accelerator: 'Command+V',
    //     selector: 'paste:'
    //   }, {
    //     label: 'Select All',
    //     accelerator: 'Command+A',
    //     selector: 'selectAll:'
    //   }]
    // },
    
     {
      label: 'View',
      submenu: [{
        label: 'On Top',
        accelerator: onTopDefinition[0],
        click: onTopDefinition[1]
      },{
        label: 'Reload',
        accelerator: 'Command+R',
        click: function() {
          mainWindow.restart();
        }
      }, {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click: function() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }, {
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+Command+I',
        click: function() {
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
        click: function() {
          mainWindow.close();
        }
      }]
    }, {
      label: '&View',
      submenu: [{
        label: '&Reload',
        accelerator: 'Ctrl+R',
        click: function() {
          mainWindow.restart();
        }
      }, {
        label: 'Toggle &Full Screen',
        accelerator: 'F11',
        click: function() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }, {
        label: 'Toggle &Developer Tools',
        accelerator: 'Alt+Ctrl+I',
        click: function() {
          mainWindow.toggleDevTools();
        }
      }]
    }, {
      label: 'Help',
      submenu: [{
        label: 'Learn More',
        click: function() {
          require('shell').openExternal('http://electron.atom.io');
        }
      }, {
        label: 'Documentation',
        click: function() {
          require('shell').openExternal('https://github.com/atom/electron/tree/master/docs#readme');
        }
      }, {
        label: 'Community Discussions',
        click: function() {
          require('shell').openExternal('https://discuss.atom.io/c/electron');
        }
      }, {
        label: 'Search Issues',
        click: function() {
          require('shell').openExternal('https://github.com/atom/electron/issues');
        }
      }]
    }];
    menu = Menu.buildFromTemplate(template);
    mainWindow.setMenu(menu);
    // debugWindow.setMenu(menu);
    // mainWindow.flashFrame(true);
    // setInterval(function(){
    //     mainWindow.setAlwaysOnTop(true);
    // }, 100);
    // 
  }
    // client.create(mainWindow);

require('electron-debug')({
    showDevTools: true
});

});

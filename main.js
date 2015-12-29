/* eslint no-path-concat: 0, func-names:0 */
var app = require('app');
var BrowserWindow = require('browser-window');
var Menu = require('menu');
var menu;
var template;
var most = require("most");


// process.on('uncaughtException', function (err) {
//   console.error(err);
//   console.log("Node NOT Exiting...");
// });

// require('electron-debug')();

require('crash-reporter').start();
var electron=require("electron");
console.log("app",electron);
electron.app = app;

var mainWindow = null;

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit();
});

// var osc = require("node-osc");
// var emitStream = require('emit-stream');
// var oscServer = new osc.Server(3333, '0.0.0.0');

// var trycatch = require('trycatch');
// trycatch.configure({'long-stack-traces': true})


process.on('uncaughtApplicationException', (err) => console.log("uncaugtAppErr",err.stack));

process.on('uncaughtException', (err) => {
  console.log("uncaughtExc",err.stack);
  // We are in an undefined state and need to restart
  // handleSoftShutodwn()
})

// var osc = require("node-osc");
// var oscServer = new osc.Server(3333, '0.0.0.0');
// console.log("oscSerrver in renderer",oscServer);
// oscServer.on("message",(d,r)=>console.log("dddoscmain",d,r));
// var ipcs=ipcStream("thomash");


var Positioner =require("electron-positioner");
app.on('ready', function() {
  mainWindow = new BrowserWindow({ width: 500, height: 600, 
    transparent:true, 
    alwaysOnTop:true,
    // frame: false,
	  
		alwaysOnTop: true,
		'min-width': 151,
		'min-height': 126,
		// 'standard-window': false,
		'use-content-size': true,
    experimentalFeatures: true,
    
    // Boolean - Allow an https page to display content like images from http URLs. Default is `false`. 
    allowDisplayingInsecureContent: false,
 
    // Boolean - Allow a https page to run JavaScript, CSS or plugins from http URLs. Default is `false`. 
    allowRunningInsecureContent: false,
    experimentalCanvasFeatures:true,
    // overlayFullscreenVideo:true,
      darkTheme: true,

    zoomFactor:1
    });
    
    // window.mainWindow = mainWindow;
    //, transparent:true,frame:false });
var positioner = new Positioner(mainWindow);

// Moves the window top right on the screen.
positioner.move('topRight');

  console.log("hey");
  mainWindow.webContents.on('did-finish-load', function() {
     
     
     
    //  new taglib.File(f[0]).readTaglibMetadata(
    //  setInterval(() =>
    //  ipcs.write("heyyy"),500);
  });

  
  if (process.env.HOT) {
    mainWindow.loadURL('file://' + __dirname + '/app/hot-dev-app.html');
  } else {
    mainWindow.loadURL('file://' + __dirname + '/app/app.html');
  }

  mainWindow.on('closed', function() {
    mainWindow = null;
  });

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
    }, {
      label: 'Edit',
      submenu: [{
        label: 'Undo',
        accelerator: 'Command+Z',
        selector: 'undo:'
      }, {
        label: 'Redo',
        accelerator: 'Shift+Command+Z',
        selector: 'redo:'
      }, {
        type: 'separator'
      }, {
        label: 'Cut',
        accelerator: 'Command+X',
        selector: 'cut:'
      }, {
        label: 'Copy',
        accelerator: 'Command+C',
        selector: 'copy:'
      }, {
        label: 'Paste',
        accelerator: 'Command+V',
        selector: 'paste:'
      }, {
        label: 'Select All',
        accelerator: 'Command+A',
        selector: 'selectAll:'
      }]
    }, {
      label: 'View',
      submenu: [{
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

const electron = require('electron')
//console.log("ELECTRON VERSION = ", process.version);
//const { inAppPurchase } = require('electron').remote

var shell = electron.shell
var robot = require("robotjs");
var CryptoJS = require("crypto-js");
var ipcMain = electron.ipcMain;
var globalShortcut = electron.globalShortcut
const {
  dialog
} = require('electron')
const storage = require('electron-storage');
var defaults = {
  email: null,
  sn: null,
  opacity: .3,
  trials: 5,
  relaunch: false
}
var toggleCounter = 0;
const path = require('path')
var dia = false;

//-------------------
var DRM = false;
var steam = true;
//-------------------

global.steam = DRM && steam;

//console.log("CHROME VERSION:", process.versions['chrome'])
//const remote = require('electron').remote

// Module to control application life.
const app = electron.app
app.commandLine.appendSwitch('widevine-cdm-path', path.join(__dirname, 'widevinecdmadapter.plugin'))
// The version of plugin can be got from `chrome://plugins` page in Chrome.
app.commandLine.appendSwitch('widevine-cdm-version', '1.4.8.866')


let pluginName
switch (process.platform) {
  case 'win32':
    pluginName = 'pepflashplayer.dll'
    break
  case 'darwin':
    pluginName = 'PepperFlashPlayer.plugin'
    break
  case 'linux':
    pluginName = 'libpepflashplayer.so'
    break
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName))

// Optional: Specify flash version, for example, v17.0.0.169
app.commandLine.appendSwitch('ppapi-flash-version', '29.0.0.117')


// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

//const ipcMain=electron.ipcMain // ? 
/*
const Tray=electron.Tray
const nativeImage=electron.nativeImage
*/
const Menubar = require('menubar');

const INDEX_HTML = path.join('file://', __dirname, 'index.html');
const PROMPT_HTML = path.join('file://', __dirname, 'prompt.html');
const MODE_HTML = path.join('file://', __dirname, 'mode.html');

const TRANSPARENT_HTML = path.join('file://', __dirname, 'transparent.html');
const MENU = path.join('file://', __dirname, 'menu.html');
const CHILD_PADDING = 0;


const url = require('url');


ipcMain.on("quitprompt", function (event, arg) {
  app.quit()
});




ipcMain.on("manual", function (event, arg) {
  shell.openExternal("http://www.cinqmarsmedia.com/chameleon/manual.html")
})
//menubar.setAlwaysOnTop(true, "floating", 1);

//const ipcMain=require('electron')

//var allScreens = screenElectron.getAllDisplays();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
const addClickableRegion = options => {
  const {
    parent
  } = options;
  const parentBounds = parent.getBounds();
  const {
    width = parentBounds.width,
    height = parentBounds.height,
    x = 0,
    y = 0
  } = options;

  // create a child window, setting the position based on the parent's bounds
  const childWindow = new BrowserWindow({
    parent,
    x: parentBounds.x + x,
    y: parentBounds.y + y,
    width: width || parentBounds.width,
    height: height || parentBounds.height,
    // disable pretty much everything
    transparent: true,
    frame: false,
    skipTaskbar: true,
    movable: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreen: false,
    webPreferences: {
      // The `plugins` have to be enabled.
      plugins: true,
      nodeIntegration: true
    },
    icon: path.join(__dirname, 'assets/icons/png/icon_32x32@2x.png')
  });
  /* ???????
    // this is a dirty workaround to set the cursor style when hovering over the button
    ipcMain.on(
      'ClickableRegion::set-child-css',
      (e, css) => childWindow.webContents.insertCSS(css)
    );
  
    // When the transpoarent child captures a mouse event, it is forwarded to the parent
    // and mapped to it's coordinates
    ipcMain.on(
      'ClickableRegion::mouse-event',
      (e, data) => {
        parent.webContents.sendInputEvent(Object.assign(
          data,
          {
            x: x + data.x,
            y: y + data.y
          }
        ));
      }
    );
  */
  childWindow.loadURL(TRANSPARENT_HTML);
  childWindow.setIgnoreMouseEvents(true);



  function initMenubar() {

    const menubar = Menubar({
      // backgroundColor: platformHelper.isMacOS ? null : '#404040',
      //hasShadow: false,
      height: 300,
      //icon: appTrayIconEnabled,
      index: MENU,
      maxWidth: 256,
      minHeight: 275,
      minWidth: 256,
      resizable: false,
      // alwaysOnTop:true,
      preloadWindow: true,
      //showDockIcon: isDebug,
      //vibrancy: systemPreferences.isDarkMode() ? 'dark' : 'light',
      width: 256,
      parent,
      webPreferences: {
        nodeIntegration: true
    }
    });
    global.menubar = menubar;
  }
  initMenubar();
};



let modeWin

function start() {

  ipcMain.on("openStreamBrowser", function (app, url) {
    global.playlist = url
    getdimensions()

    modeWin.close()

  })

  ipcMain.on("openURL", function (event, arg) {

    let result = arg;

      if (result == '') { result = "http://localhost:8080/" }

      global.playlist = result
      getdimensions()

      modeWin.close()

    });

  ipcMain.on("startwfile", function (event, arg) {

    if (typeof parent !== 'undefined') {
      parent.close();
    }
    if (!dia) {
      dia = true
      dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [{
          name: 'Movies',
          extensions: ['mkv', 'avi', 'mp4']
        }]
      }).then(filename=> {
        if (typeof filename == 'undefined') {
          //app.quit()
        } else {
          
          global.playlist = filename.filePaths
          /**/
          getdimensions();

          modeWin.close()

        }
        dia = false;
      });
    }
  })

  ipcMain.on("quitprompt", function (event, arg) {
    app.quit()
  });
  //console.log(trials)

  let modeWin = new BrowserWindow({
    width: 1038,
    height: 600,
    frame: false,
    skipTaskbar: true,
    movable: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    webPreferences: {
      // The `plugins` have to be enabled.
      plugins: true,
      nodeIntegration: true
    },
  });
  modeWin.loadURL(MODE_HTML);

  modeWin.show()
  modeWin.on('close', function (event) {
    if (typeof global.playlist == 'undefined') {
      app.quit()
    }

  });

}



function checkSN(email, sn) {
  if (email == null || sn == null) {
    return false
  }

  if (email.length < 5 || sn.length !== 12) {
    return false
  }


  /*
  for (i=0;i<email.length;i++){
    hash=hash*email.charCodeAt(i);
  }
  */

  email = email.replace(/\./g, '');
  email = email.replace(/@/g, '');
  email = email.replace(/_/g, '');
  //email=email.replace('','');

  hash = Math.pow(parseInt(email, 36), .2)
  hash = Math.floor(hash * 100000000) / 100000000


  var p = String(hash).replace('e', '7');
  p = p.replace(/\+/g, '5');
  p = p.replace(/\./g, '2');
  p = p.substring(0, 14)


  testhash = parseInt(p).toString(34)

  testhash = testhash.replace(/0/g, 'J');
  testhash = testhash.replace(/1/g, 'W');
  testhash = testhash.toUpperCase();
  testhash = testhash.replace(/0/g, 'V');
  //console.log('pretesthash',testhash);
  testhash = testhash + '1YC0Q1PU8BXLWR47'
  if (testhash.length > 12) {
    testhash = testhash.substring(0, 12)
  }
  //console.log('testhash',testhash);
  //console.log('sn',sn);

  if (testhash == sn) {
    return true
  } else {
    return false
  }
}




let promptWin;

function prompt(trials) {
  global.trials = trials;
  ipcMain.on("enterlicense", function (event, arg) {
    //console.log(checkSN(arg[0], arg[1]))
    if (checkSN(arg[0], arg[1])) {
      promptWin.webContents.send("thx");
      storage.get('data').then(data => {
        if (data.data) {
          var decrypt = CryptoJS.AES.decrypt(data.data, 'ENCRYPTION_KEY');
          data = decrypt.toString(CryptoJS.enc.Utf8);
          data = JSON.parse(data);
        } else {
          data = defaults;
        }

        data.email = arg[0]
        data.sn = arg[1]
        var encrypt = CryptoJS.AES.encrypt(JSON.stringify(data), 'ENCRYPTION_KEY')
        var temp = {
          data: String(encrypt)
        };

        storage.set('data', temp).then(function () {
          start();
          promptWin.close();
        })
      })
    } else {
      promptWin.webContents.send("invalid")
    }
  });

  ipcMain.on("purchaselicense", function (event, arg) {
    shell.openExternal("http://www.cinqmarsmedia.com/chameleon/?buy")
  });

  ipcMain.on("steamexternal", function (event, arg) {
    shell.openExternal("https://store.steampowered.com/app/834170/Chameleon_Video_Player/")
  });

  ipcMain.on("demo", function (event, arg) {
    storage.get('data').then(data => {
      if (data.data) {
        var decrypt = CryptoJS.AES.decrypt(data.data, 'ENCRYPTION_KEY');
        data = decrypt.toString(CryptoJS.enc.Utf8);
        //console.log(JSON.stringify(data)+'f');
        data = JSON.parse(data);
      } else {
        promptWin.webContents.send("triallimit")
        return;
      }



      if (trials > 0) {
        data.trials = trials - 1

        var encrypt = CryptoJS.AES.encrypt(JSON.stringify(data), 'ENCRYPTION_KEY')
        var temp = {
          data: String(encrypt)
        };
        storage.set('data', temp).then(function () {

          start()
          promptWin.close();

        })
      } else {
        promptWin.webContents.send("triallimit")
      }
    })
  });

  //console.log(trials)

  let promptWin = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    skipTaskbar: true,
    movable: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    webPreferences: {
      // The `plugins` have to be enabled.
      plugins: true,
      nodeIntegration: true
    },
  });
  promptWin.loadURL(PROMPT_HTML);

  promptWin.show()


}


function ready() {
  /*
  storage.set('data', {}).then(function () {
          prompt(defaults.trials)
        })
  */

  if (DRM) {
    storage.get('data')
      .then(data => {
        if (data.data) {
          var decrypt = CryptoJS.AES.decrypt(data.data, 'ENCRYPTION_KEY');
          data = decrypt.toString(CryptoJS.enc.Utf8);
          data = JSON.parse(data);
        }

        if (!DRM || checkSN(data.email, data.sn) || data.relaunch) { // validation function between email and sn
          global.opac = data.opacity
          if (data.relaunch) {
            data.relaunch = false;
            encrypt = CryptoJS.AES.encrypt(JSON.stringify(data), 'ENCRYPTION_KEY')
            var temp = {
              data: String(encrypt)
            };
            storage.set('data', temp);
          }
          start();
        } else {
          if ((data.trials && data.opacity) || data.trials == 0) {
            prompt(data.trials)
          } else {
            //console.log(JSON.stringify(defaults))
            encrypt = CryptoJS.AES.encrypt(JSON.stringify(defaults), 'ENCRYPTION_KEY')
            var temp = {
              data: String(encrypt)
            };
            storage.set('data', temp).then(function () {
              prompt(defaults.trials)
            })
          }
        }
      })
      .catch(err => {
        console.log('err', err)
        if (!DRM) {
          start();

        } else {
          var encrypt = CryptoJS.AES.encrypt(JSON.stringify(defaults), 'ENCRYPTION_KEY')
          var temp = {
            data: String(encrypt)
          };
          storage.set('data', temp).then(function () {
            prompt(defaults.trials)
          });
        }
      });

  } else {
    start()
  }
}

function postdialog(file) {
  //console.log('fires')
}




function getdimensions() {

  if (!/^win/.test(process.platform)) {
    app.dock.hide();
  }

  /*
    tray.on('click', function(event) {
      toggleWindow()
  
      // Show devtools when command clicked
      if (window.isVisible() && process.defaultApp && event.metaKey) {
        window.openDevTools({mode: 'detach'})
      }
    })
  
      let menubar = new BrowserWindow({
      width: 300,
      height: 350,
      show: false,
      frame: false,
      resizable: false,
    })
  
    let icon = nativeImage.createFromDataURL(base64Icon)
    tray = new Tray(icon)
  
  */
  var screenElectron = electron.screen;
  var mainScreen = screenElectron.getPrimaryDisplay();

  // hides the dock icon for our app which allows our windows to join other 
  // apps' spaces. without this our windows open on the nearest "desktop" space

  // "floating" + 1 is higher than all regular windows, but still behind things 
  // like spotlight or the screen saver

  createWindow(mainScreen.workArea.width, mainScreen.workArea.height, playlist);
  if (typeof promptWin !== 'undefined') {
    promptWin.close();
  }


}

/*
function testbutton(){
console.log('test button has fired') // what I want to happen

}
*/

function createWindow(w, h, p) {

  let parent = new BrowserWindow({
    webPreferences: {
      plugins: true,
      //sandbox: true,
      //nodeIntegration: false,
      nodeIntegration: true,
      webviewTag: true
    },
    fullscreen: false,
    width: w,
    height: h,
    transparent: true,
    frame: false,
    skipTaskbar: true,
    movable: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreen: false,

  });

  parent.setSize(w, h);

  if (typeof p !== 'string') {
    parent.setIgnoreMouseEvents(true);
  }

  parent.setAlwaysOnTop(true, "floating", 0);
  // allows the window to show over a fullscreen window
  parent.setVisibleOnAllWorkspaces(true);

  //setTimeout(()=>{}, 6000);
  ipcMain.on("toggle", function () { // here???
    toggleCounter++

    if (toggleCounter % 2) {
      parent.setIgnoreMouseEvents(true);
      //if (!/^win/.test(process.platform)) { robot.mouseClick(); }
    } else {
      parent.setIgnoreMouseEvents(false);


    }

    parent.webContents.send("toggleViz")
  })

  ipcMain.on("goBack", function (event, arg) {
    /**/


    if (DRM) {
      storage.get('data')
        .then(data => {

          if (data.data) {
            var decrypt = CryptoJS.AES.decrypt(data.data, 'ENCRYPTION_KEY');
            data = decrypt.toString(CryptoJS.enc.Utf8);
            data = JSON.parse(data);
          }
          data.relaunch = true;
          var encrypt = CryptoJS.AES.encrypt(JSON.stringify(data), 'ENCRYPTION_KEY')
          var temp = {
            data: String(encrypt)
          };

          storage.set('data', temp).then(function () {
            parent.webContents.send("relaunch")
          })
        })
    } else {
      parent.webContents.send("relaunch")

    }


  });

  ipcMain.on("opac", function (event, arg) {
    parent.webContents.send("opac", arg);
  });

  ipcMain.on("opacityplus", function (event, arg) {
    parent.webContents.send("opacityplus");
  });

  ipcMain.on("opacityminus", function (event, arg) {
    parent.webContents.send("opacityminus");
  });

  ipcMain.on("playpause", function (event, arg) {
    parent.webContents.send("playpause");
  });

  ipcMain.on("timeplus", function (event, arg) {
    parent.webContents.send("timeplus");
  });

  ipcMain.on("timeminus", function (event, arg) {
    parent.webContents.send("timeminus");
  });

  ipcMain.on("timefastback", function (event, arg) {
    parent.webContents.send("timefastback");
  });

  ipcMain.on("timefastforward", function (event, arg) {
    parent.webContents.send("timefastforward");
  });

  ipcMain.on("quit", function (event, arg) {
    app.quit()
  });




  //--------------------------------
  /**/
  parent.webContents.once('did-finish-load', () => {
    // add a transparent clickable child window to capture the mouse events


    addClickableRegion({
      parent,
      x: CHILD_PADDING,
      y: CHILD_PADDING,
      width: w,
      height: h
    });

    // KEYBOARD SHORTCUTS -------------------------------------
    globalShortcut.register('Shift+Cmd+=', () => {
      parent.webContents.send("opacityplus");
    })

    globalShortcut.register('Shift+CommandOrControl+-', () => {
      parent.webContents.send("opacityminus");
    })

    globalShortcut.register('Shift+CommandOrControl+f', () => {
      parent.webContents.send("opacityfull");
    })

    globalShortcut.register('Shift+CommandOrControl+0', () => {
      parent.webContents.send("opacityhalf");
    })

    globalShortcut.register('Shift+CommandOrControl+t', () => {
      parent.webContents.send("toggleView");
    })

    globalShortcut.register('Shift+CommandOrControl+h', () => {
      parent.webContents.send("opacitynone");
    })

    globalShortcut.register('Shift+CommandOrControl+]', () => {
      parent.webContents.send("timeplus");
    })

    globalShortcut.register('Shift+CommandOrControl+\\', () => {
      parent.webContents.send("skip");
    })

    globalShortcut.register('Shift+CommandOrControl+[', () => {
      parent.webContents.send("timeminus");
    })

    globalShortcut.register('Shift+CommandOrControl+p', () => {
      parent.webContents.send("playpause");
    })

    globalShortcut.register('Shift+CommandOrControl+m', () => {
      parent.webContents.send("mute");
    })

    //----------------------------------------------------------

    // could do this in index.html
    //parent.webContents.insertCSS(`body { padding:${CHILD_PADDING}px !important; }`);
    //parent.playlist=playlist
    //parent.webContents.send('playlist', playlist);

    parent.show();
    parent.blur();

    if (!/^win/.test(process.platform)) {
      robot.mouseClick();
    }

  });

  parent.loadURL(INDEX_HTML);
  //parent.openDevTools();
  //---------------------------------


  /*
    // and load the index.html of the app.
    parent.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }))
  */
  // Open the DevTools.
  // parent.webContents.openDevTools()

  // Emitted when the window is closed.
  parent.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    parent = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', ready)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (typeof parent !== 'undefined') {
    if (parent === null) {
      createWindow(mainScreen.workArea.width, mainScreen.workArea.height)
    }
  }
})

app.on('widevine-ready', (version, lastVersion) => {
  if (null !== lastVersion) {
    console.log('Widevine ' + version + ', upgraded from ' + lastVersion + ', is ready to be used!');
  } else {
    console.log('Widevine ' + version + ' is ready to be used!');
  }
});
app.on('widevine-update-pending', (currentVersion, pendingVersion) => {
  console.log('Widevine ' + currentVersion + ' is ready to be upgraded to ' + pendingVersion + '!');
});
app.on('widevine-error', (error) => {
  console.log('Widevine installation encountered an error: ' + error);
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
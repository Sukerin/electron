let workerWindow = null
const createWorkerWindow=function (BrowserWindow) {
    if(workerWindow) return;
    workerWindow = new BrowserWindow({
        show: false,
        webPreferences: { nodeIntegration: true }
    })
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        workerWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL+"/#worker")
        if (!process.env.IS_TEST) {
            workerWindow.webContents.openDevTools()
        }
    } else {
        // Load the index.html when not in development
        workerWindow.loadURL('app://./index.html#worker')
    }

    workerWindow.on('closed', () => {
        console.log('background window closed')
    })
    return workerWindow;
}

export default createWorkerWindow

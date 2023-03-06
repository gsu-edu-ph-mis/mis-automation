class Logger {
    constructor(browserWindow, console) {
        this.browserWindow = browserWindow
        this.console = console
    }

    log(message) {
        this.console.log(message)
        if(this.browserWindow) this.browserWindow.webContents.send('mis:onDataFromMain', `Started ${(new Date()).toLocaleTimeString('fil-PH', timeFmt)}`, 'group1')

    }
}
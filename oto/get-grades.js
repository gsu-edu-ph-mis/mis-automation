/**
 * Get grades
 * 
 * Get grade of student on a given semester.
 * 
 * @returns String file path to file
 * @throws An error
 */

//// Core modules
const fs = require('fs')
const path = require('path')

//// External modules

//// Modules
const download = require('./download-grades')


// Return FILE_OUT or throw on error
module.exports = async (args, logToRenderer) => {
    try {
        const USERNAME = args[0]
        const PASSWORD = args[1]
        const ID = args[2]
        const SEM = args[3]
        const URL = args[4]
        const DIR = args[5]

        const FILE_OUT = path.join(DIR, `term-grades-${ID}-${SEM}.xlsx`)
        if (fs.existsSync(FILE_OUT)) {
            logToRenderer(`Grades file found in ${FILE_OUT}`)
            return FILE_OUT
        }
        logToRenderer(`Downloading grades from network...`)
        await download(URL, USERNAME, PASSWORD, FILE_OUT, ID, SEM)
        logToRenderer(`Grades downloaded to ${FILE_OUT}`)
        return FILE_OUT
    } catch (error) {
        console.error(error)
        throw error
    }
}
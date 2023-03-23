/**
 * Get enrollment list
 * 
 * Get enrollment list for entire course from year 1 - 4.
 * 
 * @returns File path to FILE_OUT
 * @throws An error
 */

//// Core modules
const fs = require('fs')
const path = require('path')

//// External modules

//// Modules
const download = require('./download-enrollment-list')
const format = require('./format-enrollment-list')


// Return ExcelJS worksheet or throw an error
module.exports = async (args, logToRenderer) => {
    try {
        const USERNAME = args[0]
        const PASSWORD = args[1]
        const COLLEGE = args[2]
        const SEM = args[3]
        const COURSE = args[4]
        const YEAR = args[5]
        const URL = args[6]

        const FILE_IN = path.join(TMP_DIR, `_el-${COLLEGE}-${SEM}.xlsx`)
        const FILE_TEMPLATE = path.join(APP_DIR, `templates`, `tpl-enrollment-list.xlsx`)
        const FILE_OUT = path.join(APP_DIR, `downloads`, `Enrollment-List-${COLLEGE}-${SEM}.xlsx`)
        if (!fs.existsSync(FILE_IN)) {
            logToRenderer(`Downloading enrollment list from network...`, [3, 0])
            await download(URL, USERNAME, PASSWORD, FILE_IN, COLLEGE, SEM)
        }

        await format(FILE_TEMPLATE, FILE_IN, FILE_OUT, logToRenderer)
        logToRenderer(`Saved to ${FILE_OUT}`, [3, 3])

        return [FILE_IN, FILE_TEMPLATE, FILE_OUT]
    } catch (error) {
        console.error(error)
        throw error
    }
}
/**
 * Get enrollment list
 * 
 * Get enrollment list for entire course from year 1 - 4.
 * If year is provided, return only from that year.
 * 
 * @returns ExcelJS worksheet
 * @throws An error
 */

//// Core modules

//// External modules
const ExcelJS = require('exceljs')

//// Modules
const toWorkSheet = require('./to-worksheet')
const copyWorkSheet = require('./copy-worksheet')


// Return ExcelJS worksheet or throw an error
module.exports = async (FILE_TEMPLATE, FILE_IN, FILE_OUT, logToRenderer) => {
    let browser = null
    try {
        const workSheet = await toWorkSheet(FILE_IN, 'Sheet1') // Convert path to xlsx into exceljs worksheet

        // Group rows into courses
        const START_ROW = 8 // Start of row data
        let courses = {}
        for (let rowNumber = 1; rowNumber <= workSheet.rowCount; rowNumber++) {
            const row = workSheet.getRow(rowNumber)
            if (rowNumber >= START_ROW) {
                let NUMBER = (new String(row.getCell(1).text)).trim()
                let CODE = (new String(row.getCell(2).text)).trim()
                let NAME = (new String(row.getCell(3).text)).trim()
                let GENDER = (new String(row.getCell(4).text)).trim()
                let COURSE = (new String(row.getCell(5).text)).trim()
                let YEAR = (new String(row.getCell(6).text)).trim()

                if (!courses[COURSE]) {
                    courses[COURSE] = []
                }
                courses[COURSE].push({
                    number: NUMBER,
                    code: CODE,
                    name: NAME,
                    gender: GENDER,
                    course: COURSE,
                    year: YEAR,
                })
            }
        }

        // Sort by year level from 1-4
        for (const course in courses) {
            // Sort by year
            courses[course].sort((a, b) => {
                if (a.year < b.year) {
                    return -1;
                }
                if (a.year > b.year) {
                    return 1;
                }
                return 0;
            })
        }

        // Generate output file based on a template
        const workbookOut = new ExcelJS.Workbook();
        await workbookOut.xlsx.readFile(FILE_TEMPLATE)
        const worksheetOut = workbookOut.getWorksheet('Sheet1')


        const OFFSET = 13
        for (const course in courses) {
            const copySheet = copyWorkSheet(workbookOut, 'Sheet1', course)

            // Loop
            courses[course].forEach((student, i) => {
                copySheet.getRow(i + OFFSET).getCell(1).value = i + 1
                copySheet.getRow(i + OFFSET).getCell(2).value = student.code
                copySheet.getRow(i + OFFSET).getCell(3).value = student.name
                copySheet.getRow(i + OFFSET).getCell(4).value = student.gender
                copySheet.getRow(i + OFFSET).getCell(5).value = student.course
                copySheet.getRow(i + OFFSET).getCell(6).value = student.year
            })
        }
        workbookOut.removeWorksheet(worksheetOut.id)
        await workbookOut.xlsx.writeFile(FILE_OUT);

        return workbookOut

    } catch (error) {
        console.error(error)
        if (browser) {
            await browser.close();
        }
        throw error
    }
}
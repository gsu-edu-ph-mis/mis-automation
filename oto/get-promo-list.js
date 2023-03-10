/**
 * Main.js
 */

//// Core modules
const fs = require('fs')
const path = require('path')

//// External modules
const ExcelJS = require('exceljs')

//// Modules
const getGrades = require('./get-grades')
const getEnrollmentList = require('./get-enrollment-list')
const downloadEnrollmentList = require('./download-enrollment-list')
const toWorkSheet = require('./to-worksheet')
const copyWorkSheet = require('./copy-worksheet')


module.exports = async (args, logToRenderer) => {
    try {
        const USERNAME = args[0]
        const PASSWORD = args[1]
        const COLLEGE = args[2]
        const SEM = args[3]
        const COURSE = args[4]
        const YEAR = args[5]
        const URL = args[6]
        const TARGET_DIR = args[7]

        const timeFmt = {
            timeZone: 'Asia/Manila',
            hour: 'numeric',
            minute: '2-digit',
            second: 'numeric',
        }
        logToRenderer(`Started ${(new Date()).toLocaleTimeString('fil-PH', timeFmt)}`)

        // LOAD MASTERLIST AND DOWNLOAD GRADES PER SEM
        const ENROLLMENT_LIST = path.join(TMP_DIR, `_el-${COLLEGE}-${SEM}.xlsx`)
        if (!fs.existsSync(ENROLLMENT_LIST)) {
            logToRenderer(`Downloading enrollment list from network...`)
            await downloadEnrollmentList(URL, USERNAME, PASSWORD, ENROLLMENT_LIST, COLLEGE, SEM, logToRenderer)
        }
        const workSheet = await toWorkSheet(ENROLLMENT_LIST, 'Sheet1') // Convert path to xlsx into exceljs worksheet

        // Group rows into courses
        const START_ROW = 8 // Start of row data
        let rowCount = 0
        let courses = {}
        for (let rowNumber = 1; rowNumber <= workSheet.rowCount; rowNumber++) {
            const row = workSheet.getRow(rowNumber)
            if (rowNumber >= START_ROW) {
                ++rowCount
                let NUMBER = (new String(row.getCell(1).text)).trim()
                let CODE = (new String(row.getCell(2).text)).trim()
                let NAME = (new String(row.getCell(3).text)).trim()
                let GENDER = (new String(row.getCell(4).text)).trim()
                let COURSE = (new String(row.getCell(5).text)).trim()
                let YEAR = (new String(row.getCell(6).text)).trim()
                // let UNITS = (new String(row.getCell(7).text)).trim()
                let ADDRESS = (new String(row.getCell(11).text)).trim()

                let lastName = ''
                let firstName = ''
                let middleName = ''

                try {

                    let names = NAME
                    names = names.replace(',,', ',') // Remove double commas
                    names = names.split(',')
                    if (names[0]) {
                        lastName = names[0]
                    }
                    if (names[1]) {
                        firstName = names[1]
                        if (/( [A-Za-z]\.)$/.test(firstName)) { // has middle initial: G. but not Jr.
                            firstName = names[1].slice(0, names[1].length - 2)
                            middleName = names[1].slice(-2)
                        }
                    }

                    lastName = new String(lastName).trim()
                    firstName = new String(firstName).trim()
                    middleName = new String(middleName).trim()
                } catch (err) {
                    console.error(rowCount, err)
                    console.error(`Error on row ${rowCount} - ${NAME}`)
                    lastName = NAME
                }

                if (!courses[COURSE]) {
                    courses[COURSE] = {
                        '1': [],
                        '2': [],
                        '3': [],
                        '4': []
                    }
                }

                courses[COURSE][YEAR].push({
                    number: NUMBER,
                    code: CODE,
                    lastName: lastName,
                    firstName: firstName,
                    middleName: middleName,
                    gender: GENDER,
                    course: COURSE,
                    year: YEAR,
                    address: ADDRESS,
                    subjects: [],
                })
            }
        }

        const stringYear = (year) => {
            if (year == 1) {
                return '1st'
            } else if (year == 2) {
                return '2nd'
            } else if (year == 3) {
                return '3rd'
            }
            return year + 'th'
        }

        // Downloads
        let dontLog = () => { }
        for (const course in courses) {
            for (const year in courses[course]) {
                logToRenderer(`Downloading ${courses[course][year].length} student grades from ${course} ${stringYear(year)} year`)
                for (let i = 0; i < courses[course][year].length; ++i) {
                    let student = courses[course][year][i]
                    let filePath = ''
                    try {
                        filePath = await getGrades([USERNAME, PASSWORD, student.code, SEM, URL, TMP_DIR], dontLog)
                        // logToRenderer(`${i + 1}. Student ${student.code} downloaded.`)

                        const gradeWorkSheet = await toWorkSheet(filePath)
                        for (let rowNumber = 1; rowNumber <= gradeWorkSheet.rowCount; rowNumber++) {
                            const row = gradeWorkSheet.getRow(rowNumber)
                            if (rowNumber >= 9) {
                                let code = (new String(row.getCell(1).text)).trim()
                                let name = (new String(row.getCell(2).text)).trim()
                                let grade1 = (new String(row.getCell(7).text)).trim()
                                let grade2 = (new String(row.getCell(8).text)).trim()
                                let units = (new String(row.getCell(9).text)).trim()
                                let remarks = (new String(row.getCell(10).text)).trim()

                                courses[course][year][i].subjects.push({
                                    code: code,
                                    name: name,
                                    grade1: grade1,
                                    grade2: grade2,
                                    units: units,
                                    remarks: remarks,
                                })
                            }
                        }

                    } catch (err) {
                        console.error(err)
                        logToRenderer(`${i + 1}. Error downloading ${student.code}.`)

                    }

                }
            }
        }

        // Generate output file based on a template
        const FILE_TEMPLATE = path.join(APP_DIR, `templates`, `tpl-promotional-list.xlsx`)
        const workbookOut = new ExcelJS.Workbook();
        await workbookOut.xlsx.readFile(FILE_TEMPLATE)
        const worksheetOut = workbookOut.getWorksheet('Sheet1')

        const OFFSET = 11
        const headerFontStyles = { name: 'Tahoma', bold: true }
        const yellowFill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: `FFFFFF00` }
        }

        for (const course in courses) {

            let copySheet = copyWorkSheet(workbookOut, 'Sheet1', course)
            let currentRow = OFFSET

            for (const year in courses[course]) {

                currentRow++
                copySheet.getRow(currentRow).font = { ...copySheet.getRow(currentRow).font, ...headerFontStyles }
                copySheet.getRow(currentRow).getCell(1).value = 'No.'
                copySheet.getRow(currentRow).getCell(2).value = 'ID No.'
                copySheet.getRow(currentRow).getCell(3).value = 'Surname'
                copySheet.getRow(currentRow).getCell(4).value = 'First Name'
                copySheet.getRow(currentRow).getCell(5).value = 'M. Name'
                copySheet.getRow(currentRow).getCell(6).value = 'Sex'
                copySheet.getRow(currentRow).getCell(7).value = 'Address'
                copySheet.getRow(currentRow).getCell(8).value = 'Code'
                copySheet.getRow(currentRow).getCell(9).value = 'Subjects'
                copySheet.getRow(currentRow).getCell(10).value = 'Grades'
                copySheet.getRow(currentRow).getCell(11).value = 'Units'
                for (let x = 1; x <= 11; x++) {
                    copySheet.getRow(currentRow).getCell(x).fill = { ...copySheet.getRow(currentRow).fill, ...yellowFill }
                }
                currentRow++

                copySheet.mergeCells(`A${currentRow}:B${currentRow}`)
                copySheet.getRow(currentRow).getCell(1).value = `${stringYear(year)} Year`
                copySheet.getRow(currentRow).font = { ...copySheet.getRow(currentRow).font, ...headerFontStyles }
                copySheet.getRow(currentRow).getCell(1).alignment.horizontal = 'left'
                copySheet.getRow(currentRow).getCell(1).fill = yellowFill
                currentRow++

                courses[course][year].forEach((student, i) => {

                    copySheet.getRow(currentRow).getCell(1).font.bold = false
                    copySheet.getRow(currentRow).getCell(1).value = i + 1
                    copySheet.getRow(currentRow).getCell(2).value = student.code
                    copySheet.getRow(currentRow).getCell(3).value = student.lastName
                    copySheet.getRow(currentRow).getCell(4).value = student.firstName
                    copySheet.getRow(currentRow).getCell(5).value = student.middleName
                    copySheet.getRow(currentRow).getCell(6).value = student.gender
                    copySheet.getRow(currentRow).getCell(7).value = student.address

                    // Loop grades
                    let totalUnits = 0
                    let startRow = currentRow
                    student.subjects.forEach((subject, i) => {
                        copySheet.getRow(currentRow).getCell(8).value = subject.code
                        copySheet.getRow(currentRow).getCell(9).value = subject.name

                        let grade = subject.grade2
                        if (grade === 'P') grade = subject.grade1
                        if (!grade) {
                            grade = 'INC'
                        }
                        if (!isNaN(grade)) {
                            grade = parseFloat(grade)
                        }

                        copySheet.getRow(currentRow).getCell(10).value = grade
                        copySheet.getRow(currentRow).getCell(11).value = subject.units

                        totalUnits += parseFloat(subject.units)
                        currentRow++
                    })
                    let endRow = currentRow - 1
                    copySheet.getRow(currentRow).getCell(9).value = `Total Units`
                    copySheet.getRow(currentRow).getCell(11).value = {
                        formula: `=SUM(J${startRow}:J${endRow})`,
                        result: totalUnits
                    }
                    currentRow++
                    currentRow++
                })
            }
        }
        workbookOut.removeWorksheet(worksheetOut.id)

        const PROMO_LIST_FILE = path.join(TARGET_DIR, `Promotional-List-${COLLEGE}-${SEM}.xlsx`)
        await workbookOut.xlsx.writeFile(PROMO_LIST_FILE);
        logToRenderer(`Ended ${(new Date()).toLocaleTimeString('fil-PH', timeFmt)}`)
        logToRenderer(`Done. See ${PROMO_LIST_FILE}`)

        return workbookOut
    } catch (error) {
        console.error(error)
        throw error
    }
}
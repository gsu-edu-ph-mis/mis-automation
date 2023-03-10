/**
 * Convert file to exceljs and return reference to worksheet given by sheetName
 */

//// Core modules

//// External modules
const ExcelJS = require('exceljs')

//// Modules

module.exports = async (file, sheetName = 'Sheet1') => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file)
    return workbook.getWorksheet(sheetName)
}
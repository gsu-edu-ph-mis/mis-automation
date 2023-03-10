/**
 * 
 */

//// Core modules

//// External modules

//// Modules

module.exports = (workBook, sheetName1, sheetName2) => {
    const workSheet1 = workBook.getWorksheet(sheetName1)
    const copySheet = workBook.addWorksheet(sheetName2)
    copySheet.model = Object.assign(workSheet1.model, {
        mergeCells: workSheet1.model.merges
    })
    copySheet.name = sheetName2
    return copySheet
}
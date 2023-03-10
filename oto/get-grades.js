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
const { chromium } = require('playwright')  // Or 'chromium' or 'webkit'.

//// Modules


// Return filePath or throw on error
module.exports = async (args, logToRenderer) => {
    let browser = null
    try {
        const USERNAME = args[0]
        const PASSWORD = args[1]
        const ID = args[2]
        const SEM = args[3]
        const URL = args[4]
        const DIR = args[5]

        const filePath = path.join(DIR, `term-grades-${ID}-${SEM}.xlsx`)
        if (fs.existsSync(filePath)) {
            logToRenderer(`Grades file found in ${filePath}`)
            return filePath
        }
        logToRenderer(`Downloading grades from network...`)

        browser = await chromium.launch({
            // headless: false,
            // devtools: true,
        });
        const page = await browser.newPage();
        await page.goto(URL, {
            waitUntil: 'networkidle',
        });

        await page.locator("text='Administrator'").click()
        await page.locator(`input[type="password"]`).nth(0).type(USERNAME)
        await page.locator(`input[type="password"]`).nth(1).type(PASSWORD)
        await page.locator("text='Login'").click()

        await page.locator("text='Reports'").click()
        await page.locator("text='Registrar'").click()
        await page.locator("text='Grades'").click()
        await page.locator("text='Individual Term Grades (Match Curriculum)'").click()
        // await new Promise(resolve => setTimeout(resolve, 500)) // Rate limit 
        
        await page.locator(`:text("Student") + div`).locator('> input').fill(ID)
        // await new Promise(resolve => setTimeout(resolve, 500)) // Rate limit 

        await page.locator(`:text("Period") + div`).locator('> input').fill(SEM)
        // await new Promise(resolve => setTimeout(resolve, 500)) // Rate limit 

        await page.locator(`:text("Level") + div`).click()
        // await new Promise(resolve => setTimeout(resolve, 500)) // Rate limit 
        await page.locator("text='College'").click()
        // await new Promise(resolve => setTimeout(resolve, 500)) // Rate limit 

        await page.locator("text='Refresh'").click()

        const downloadPromise = page.waitForEvent('download')
        await new Promise(resolve => setTimeout(resolve, 2000)) // Rate limit 
        await page.locator("text='XLS'").click()
        const download = await downloadPromise;
        await download.saveAs(filePath)

        // Close the tab (optional can be commented out)
        // await page.locator(`body > div:nth-child(3) > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div > div > div > div:nth-child(2) > div`).click()
        // await new Promise(resolve => setTimeout(resolve, 10000)) // Rate limit 

        await browser.close();
        logToRenderer(`Grades downloaded to ${filePath}`)
        return filePath

    } catch (error) {
        console.error(error)
        if (browser) {
            await browser.close();
        }
        throw error
    }
}
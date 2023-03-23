/**
 * Download grades
 * 
 * @returns String file path to file
 * @throws An error
 */

//// Core modules

//// External modules
const { chromium } = require('playwright')  // Or 'chromium' or 'webkit'.

//// Modules


// Return filePath or throw on error
module.exports = async (URL, USERNAME, PASSWORD, FILE_OUT, ID, SEM) => {
    let browser = null
    try {
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
        await download.saveAs(FILE_OUT)

        // Close the tab (optional can be commented out)
        // await page.locator(`body > div:nth-child(3) > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div > div > div > div:nth-child(2) > div`).click()
        // await new Promise(resolve => setTimeout(resolve, 10000)) // Rate limit 

        await browser.close();
        return FILE_OUT

    } catch (error) {
        console.error(error)
        if (browser) {
            await browser.close();
        }
        throw error
    }
}
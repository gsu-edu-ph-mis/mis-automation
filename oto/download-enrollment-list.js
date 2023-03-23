/**
 * Download enrollment list
 * 
 * 
 * @returns String file name
 * @throws An error
 */

//// Core modules
const path = require('path')

//// External modules
const { chromium } = require('playwright')  // Or 'chromium' or 'webkit'.

//// Modules


module.exports = async (URL, USERNAME, PASSWORD, FILE_OUT, COLLEGE, SEM) => {
    let browser = null
    try {
        browser = await chromium.launch({
            // headless: false,
            // devtools: true,
        })
        const page = await browser.newPage()
        await page.goto(URL, {
            waitUntil: 'networkidle',
        })

        await page.locator("text='Administrator'").click()
        await page.locator(`input[type="password"]`).nth(0).type(USERNAME)
        await page.locator(`input[type="password"]`).nth(1).type(PASSWORD)
        await page.locator("text='Login'").click()

        await page.locator("text='Reports'").click()
        await page.locator("text='Registrar'").click()
        await page.locator("text='Enrollment List'").click()

        // SELECT COLLEGE
        await page.locator(`body > div:nth-child(3) > div:nth-child(1) > div:nth-child(3) > div.qx-main > div > div > div > div > div > div:nth-child(1) > div:nth-child(1) > div:nth-child(6) > input`).type(COLLEGE)

        // SELECT LEVEL
        await page.locator(`:text("Level") + div`).click()
        await new Promise(resolve => setTimeout(resolve, 500)) // Rate limit 
        await page.locator("text='College'").click()

        // SEMESTER
        await page.locator(`body > div:nth-child(3) > div:nth-child(1) > div:nth-child(3) > div.qx-main > div > div > div > div > div > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > input`).fill(SEM)
        await new Promise(resolve => setTimeout(resolve, 500)) // Rate limit 

        // GROUP BY COURSES
        await page.locator(`:text("Order") + div`).click()
        await new Promise(resolve => setTimeout(resolve, 500)) // Rate limit 
        await page.locator("text='Course'").nth(2).click()

        await new Promise(resolve => setTimeout(resolve, 500)) // Rate limit 
        await page.locator("text='Refresh'").nth(1).click()
        await new Promise(resolve => setTimeout(resolve, 500)) // Rate limit 

        const downloadPromise = page.waitForEvent('download')
        await new Promise(resolve => setTimeout(resolve, 2000)) // Rate limit 
        await page.locator("text='XLS'").click()
        const download = await downloadPromise;
        await download.saveAs(FILE_OUT)
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
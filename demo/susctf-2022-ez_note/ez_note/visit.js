const opt = {
    name: "ez_note",
    router: "ez_note",
    site: "http://localhost:10001",
    template: "note"
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const visit = async (browser, path) =>{
    let site = "http://localhost:10001"
    let url = new URL(path, site)
    console.log(`[+]${opt.name}: ${url}`)
    let renderOpt = {...opt}
    try {
        const loginpage = await browser.newPage()
        await loginpage.goto(site+"/signin")
        await loginpage.type("input[name=username]", "admin")
        await loginpage.type("input[name=password]", "94rh58g3hfj9cpq01smxioanlc")
        await Promise.all([
            loginpage.click('button[name=submit]'),
            loginpage.waitForNavigation({waitUntil: 'networkidle0', timeout: 2000})
        ])
        await loginpage.goto("about:blank")
        await loginpage.close()

        const page = await browser.newPage()
        await page.goto(url.href, {waitUntil: 'networkidle0', timeout: 2000})

        await delay(5000) /// waiting 5 second.

    } catch (e) {
        console.log(e)
        renderOpt.message = "error occurred"
        return renderOpt
    }
    renderOpt.message = "admin will view your report soon"
    return renderOpt
}

module.exports = {
    opt:opt,
    visit:visit
}

run = (async () => {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
        headless: false,
    });
    var arguments = process.argv;
    await visit(browser, arguments[2]);
})

run()


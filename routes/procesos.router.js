const express = require('express')
const router = express.Router()
const core = require('os')

router.get('/', (req, res) => {
    const args = process.argv.slice(2).length === 0 ? " - ": process.argv.slice(2).join(" - ")

    const processData = {
        args,
        platform: process.platform,
        node: process.version,
        memory: process.memoryUsage().rss,
        path: process.execPath,
        pid: process.pid,
        folder: process.cwd(),
        cpus: core.cpus().length
    }

    res.render('info', {
        ...processData
    })
})

module.exports = router
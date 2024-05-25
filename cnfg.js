const cwd = process.cwd()
const path = require('path')

module.exports = {
    POINT_DEFAULT: path.join(__dirname, "./config/point.xlsx"),
    POINT_USER: path.join(cwd, "point.xlsx"),
    POINT_DOWNLOAD: "/point.xlsx",

    // 和驱动相关的地址
    DRIVER_DEFAULT: path.join(__dirname, "./config/driver.xlsx"),
    DRIVER_USER: path.join(cwd, "driver.xlsx"),
    DRIVER_DOWNLOAD: "/driver.xlsx",
}
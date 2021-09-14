const timeLeft = (timestamp) => {
    let rightNow = Date.now()/1000
    let timeleft = timestamp - rightNow
    if (timeleft < 0) {
        return [-1,0]
    } else {
        let [hrs, mins] = secsToText(timeleft)
        return [hrs, mins, timeleft]
    }
}

const secsToText = (secs) => {
    let hrs = Math.floor(secs / 60 / 60)
    let mins = Math.floor((secs / 60 - hrs * 60))
    return [hrs, mins]
}

module.exports = {
    secsToText,
    timeLeft
}
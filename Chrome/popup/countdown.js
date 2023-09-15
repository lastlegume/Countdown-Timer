const set = document.getElementById("set");
set.addEventListener('click', () => setDate());
calcOffset();
setInterval(() => calcOffset(), 1000);


async function calcOffset() {
    var d = new Date();
    try {
        var target = await chrome.storage.local.get('target');
    } catch (error) {
        console.log(error);
    }
    target = new Date(target.target);
    var header = document.getElementById("header");
    header.textContent = "Time Until " + target.toLocaleDateString();
    var subhead = document.getElementById("subhead");
    subhead.textContent = target.toLocaleTimeString();
    var day = document.getElementById("day");
    var combined = target - d;
    var days = Math.max(0, Math.floor((combined) / 86400000));
    day.textContent = days + (days == 1 ? " day" : " days");
    var hour = document.getElementById("hour");
    var hours = Math.max(0, Math.floor((combined) / 3600000 - days * 24));
    hour.textContent = Math.floor(hours) + (Math.floor(hours) == 1 ? " hour" : " hours");
    var min = document.getElementById("minute");
    var mins = Math.max(0, Math.floor((combined) / 60000 - days * 1440 - hours * 60));
    min.textContent = Math.floor(mins) + (Math.floor(mins) == 1 ? " minute" : " minutes");
    var sec = document.getElementById("second");
    var secs = Math.max(0, Math.floor((combined) / 1000 - days * 86400 - hours * 3600 - mins * 60));
    sec.textContent = Math.floor(secs) + (Math.floor(secs) == 1 ? " second" : " seconds");

    if (days == 0) {
        day.style.setProperty('color', 'red');
        if (hours == 0) {
            hour.style.setProperty('color', 'red');
            if (mins == 0) {
                min.style.setProperty('color', 'red');
                if (secs == 0)
                    sec.style.setProperty('color', 'red');
            }
        }
    }
    return secs;
}
function setDate() {
    calcOffset();
    var date = new Date(document.getElementById("date").value);
    //    var num = date.getTime()+(date.getTimezoneOffset()*60000);
    //  date = new Date(num);
    //console.log(date);
    let d = new Date();
    if(!isNaN(date.getTime())){
        chrome.storage.local.set({ 'target': date.getTime()});
        chrome.storage.local.set({'start': d.getTime()});
    }
    calcOffset();
}

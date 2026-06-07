// NOTE: num is the index of the active timer

const add = document.getElementById("add");
const remove = document.getElementById("remove");
var darkmode = false;
chrome.storage.local.get("theme").then(setup, handler)

// maximum length before the name of the event is truncated
const maxlen = 25;


function setup(mode) {
    darkmode = mode.theme == 1;

    //dark mode switch
    // from https://www.cssportal.com/blog/css-dark-mode-guide/
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;

    function toggleTheme() {
        body.classList.toggle('dark-mode');
        darkModeToggle.classList.toggle('dark-mode');
        darkModeToggle.children[0].classList.toggle('dark-mode');
        darkModeToggle.children[1].classList.toggle('dark-mode');
        add.classList.toggle('dark-mode');
        remove.classList.toggle('dark-mode');
        darkmode = !darkmode;
        chrome.storage.local.set({ "theme": darkmode ? 1 : 0 })
    }

    darkModeToggle.addEventListener('click', toggleTheme);
    if (darkmode) {
        toggleTheme();
        darkmode = true;
        chrome.storage.local.set({ "theme": 1 });
    }
    else
        chrome.storage.local.set({ "theme": 0 });





    // maximum length before the name of the event is truncated
    const maxlen = 25;
    populate();
    add.addEventListener('click', () => setDate());
    remove.addEventListener('click', () => awaitRemove());
    var list = document.getElementById("list");
    list.addEventListener("change", () => changeDate());
    calcOffset();
    setInterval(() => calcOffset(), 1000);

    function changeDate() {
        chrome.storage.local.set({ 'number': list.value });
    }
    async function awaitRemove() {
        var num = await chrome.storage.local.get('number');
        removeDate(num.number);
    }

    async function calcOffset() {
        var d = new Date();

        try {
            var num = await chrome.storage.local.get('number');
            num = num.number;
            var target = await chrome.storage.local.get(['target' + num]);
            var name = await chrome.storage.local.get(['name' + num]);
        } catch (error) {
            console.log(error);
        }
        target = new Date(target['target' + num]);
        name = name['name' + num];

        var header = document.getElementById("header");
        var subhead = document.getElementById("subhead");

        if (name) {
            header.textContent = "Time Until " + name;
            subhead.textContent = target.toLocaleDateString() + " at " + target.toLocaleTimeString();
        } else {
            header.textContent = "Time Until " + target.toLocaleDateString();
            subhead.textContent = target.toLocaleTimeString();
        }
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

        day.style.removeProperty('color');
        hour.style.removeProperty('color');
        min.style.removeProperty('color');
        sec.style.removeProperty('color');

        if (days == 0) {
            day.style.setProperty('color', darkmode ? 'rgb(204, 28, 28)' : 'red');
            if (hours == 0) {
                hour.style.setProperty('color', darkmode ? 'rgb(204, 28, 28)' : 'red');
                if (mins == 0) {
                    min.style.setProperty('color', darkmode ? 'rgb(204, 28, 28)' : 'red');
                    if (secs == 0)
                        sec.style.setProperty('color', darkmode ? 'rgb(204, 28, 28)' : 'red');
                }
            }
        }
        chrome.runtime.sendMessage("draw");

        return secs;
    }
    async function setDate() {
        calcOffset();
        try {
            var data = Object.keys(await chrome.storage.local.get());
        } catch (error) {
            console.log(error);
        }
        var n = Math.floor((data.length - 2) / 3);
        var date = new Date(document.getElementById("date").value);

        if (!isNaN(date.getTime())) {
            chrome.storage.local.set({ ['target' + n]: date.getTime() });
            chrome.storage.local.set({ ['start' + n]: Date.now() });
            chrome.storage.local.set({ ['name' + n]: document.getElementById("name").value });
            chrome.storage.local.set({ 'number': n });

            var day = document.getElementById("day");
            var hour = document.getElementById("hour");
            var min = document.getElementById("minute");
            var sec = document.getElementById("second");

            day.style.setProperty('color', 'black');
            hour.style.setProperty('color', 'black');
            min.style.setProperty('color', 'black');
            sec.style.setProperty('color', 'black');
        }
        calcOffset();
        populate();
        if (!isNaN(date.getTime()))
            chrome.runtime.sendMessage("draw");
    }
    async function populate() {
        //converts old versions (1.x.x) to the new format of versions 2.x.x
        try {
            var tar = await chrome.storage.local.get('target');
        } catch (error) {
        }
        tar = Object.entries(tar);
        if (tar.length != 0) {
            var sta = await chrome.storage.local.get('start');
            chrome.storage.local.set({ 'target0': tar[0][1] });
            chrome.storage.local.set({ 'start0': sta.start });
            chrome.storage.local.remove('target');
            chrome.storage.local.remove('start');
        }
        //removes old timers
        checkForFinished();

        // populate default timer if nothing in storage currently
        var stuff = await chrome.storage.local.get();
        let d = new Date();
        if (Object.values(stuff).length <= 3) {
            await chrome.storage.local.set({ 'target0': (new Date(d.getFullYear() + 1, 0, 1)).getTime() });
            await chrome.storage.local.set({ 'start0': Date.now() });
            await chrome.storage.local.set({ 'number': 0 });
        }
        //adds options to the selection so that the user can choose which timer to use
        var list = document.getElementById("list");
        list.options.length = 0;
        try {
            var number = await chrome.storage.local.get('number');
            // if (number.number == 0) {
            //     chrome.storage.local.set({ 'number': 0 });
            // }
            var data = Object.keys(await chrome.storage.local.get());
        } catch (error) {
            console.log(error);
        }
        var placeholder = document.createElement("option");
        placeholder.text = ' - - select another timer - - ';
        placeholder.value = 0;
        placeholder.disabled = true;
        placeholder.selected = true;
        placeholder.hidden = true;
        list.add(placeholder)

        for (var i = 0; i < Math.floor((data.length - 2) / 3); i++) {

                var option = document.createElement("option");
                var txt = await chrome.storage.local.get('target' + i);
                let name = "";
                let nameFound = false;
                try {
                    name = await chrome.storage.local.get('name' + i);
                    nameFound = true;
                } catch {
                    nameFound = false;
                }

                if (nameFound && name["name" + i]) {
                    txt = truncName(name["name" + i]);
                } else {
                    let targetDate = new Date(txt['target' + i]);
                    txt = targetDate.toLocaleString();
                }

                option.text = txt;
                option.value = i;
                list.add(option);
        }
    }
    async function removeDate(num) {
        if (num > -1) {
            chrome.storage.local.remove('target' + num);
            chrome.storage.local.remove('start' + num);
            chrome.storage.local.remove('name' + num);
            var data = await chrome.storage.local.get();

            data = Object.entries(data);
            var counter = 0;
            // console.log(data);
            for (var i = 0; i < data.length; i++) {
                var startss = data[i][0].substring(0, 5);
                if (startss === "start" && parseInt(data[i][0].substring(5)) > num) {
                    chrome.storage.local.set({ ['start' + (parseInt(data[i][0].substring(5)) - 1)]: data[i][1] });
                    counter++;
                }
                if (startss === "targe" && parseInt(data[i][0].substring(6)) > num) {
                    chrome.storage.local.set({ ['target' + (parseInt(data[i][0].substring(6)) - 1)]: data[i][1] });
                }
                if (startss.substring(0, 4) === "name" && parseInt(data[i][0].substring(4)) > num) {
                    chrome.storage.local.set({ ['name' + (parseInt(data[i][0].substring(4)) - 1)]: data[i][1] });
                }
            }
            if (counter == 0) {
                chrome.storage.local.set({ 'number': num - 1 });
            }
            num = Math.floor((data.length - 2) / 3);
            chrome.storage.local.remove('target' + num);
            chrome.storage.local.remove('start' + num);
            chrome.storage.local.remove('name' + num);

            populate();
            chrome.runtime.sendMessage("draw");

        }
    }
    async function checkForFinished() {
        var data = await chrome.storage.local.get();
        data = Object.entries(data);

        for (var i = 0; i < data.length; i++) {
            if (data[i][0].substring(0, 6) === 'target') {
                // if from a previous version without names, add a blank name
                let n = parseInt(data[i][0].substring(6));
                let name = chrome.storage.local.get(['name' + n]).catch(() => { chrome.storage.local.set({ ['name' + n]: "" }) });
                if (data[i][1] + 3600000 < Date.now()) {
                    removeDate(data[i][0].substring(6));
                }
            }
        }

    }
}

function handler() {
    chrome.storage.local.set({ "theme": 0 });
    setup({ "theme": 0 });
}

function truncName(name) {
    if (name.length > maxlen)
        return name.substring(0, maxlen) + "...";
    return name;
}
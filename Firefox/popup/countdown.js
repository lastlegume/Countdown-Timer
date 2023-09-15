populate();
const add = document.getElementById("add");
add.addEventListener('click', () => setDate());
const remove = document.getElementById("remove");
remove.addEventListener('click', () => awaitRemove());
var list = document.getElementById("list");
list.addEventListener("change", () => changeDate());
calcOffset();
setInterval(() => calcOffset(), 1000);

function changeDate() {
    console.log('change ' + list.value);
    browser.storage.local.set({ 'number': list.value });
}
async function awaitRemove() {
    var num = await browser.storage.local.get('number');
    removeDate(num);
}
async function calcOffset() {
    var d = new Date();

    try {
        var num = await browser.storage.local.get({ 'number': 0 });
        num = num.number;
        var target = await browser.storage.local.get({ ['target' + num]: new Date(2038, 0, 19, 3, 14) });
        //        var start = await browser.storage.local.get({ ['start'+num]: new Date(2025, 0, 1) });
    } catch (error) {
        console.log(error);
    }
    //console.log(target);
    var header = document.getElementById("header");
    header.textContent = "Time Until " + target['target' + num].toLocaleDateString();
    var subhead = document.getElementById("subhead");
    subhead.textContent = target['target' + num].toLocaleTimeString();
    var day = document.getElementById("day");
    var combined = target['target' + num] - d;
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
    day.style.setProperty('color', 'black');
    hour.style.setProperty('color', 'black');
    min.style.setProperty('color', 'black');
    sec.style.setProperty('color', 'black');
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
async function setDate() {
    calcOffset();
    try {
        var data = Object.keys(await browser.storage.local.get());
    } catch (error) {
        console.log(error);
    }
    var n = (data.length - 1) / 2;
    var date = new Date(document.getElementById("date").value);
    //    var num = date.getTime()+(date.getTimezoneOffset()*60000);
    //  date = new Date(num);
    //console.log(date);
    let d = new Date();
    if (!isNaN(date.getTime())) {
        browser.storage.local.set({ ['target' + n]: date });
        browser.storage.local.set({ ['start' + n]: d });
        browser.storage.local.set({ 'number': n });

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
        browser.runtime.sendMessage("draw");

}
async function populate() {
    //converts old versions (1.x.x) to the new format of versions 2.x.x
    try {
        var tar = await browser.storage.local.get('target');
    } catch (error) {
    }
    tar = Object.entries(tar);
    if(tar.length!=0){
        var sta = await browser.storage.local.get('start');
        browser.storage.local.set({'target0':tar[0][1]});
        browser.storage.local.set({'start0':sta.start});
        browser.storage.local.remove('target');
        browser.storage.local.remove('start');
    }
    //removes old timers
    checkForFinished();
    //adds options to the selection so that the user can choose which timer to use
    var list = document.getElementById("list");
    list.options.length = 0;
    try {
        var number = await browser.storage.local.get({ 'number': 0 });
        if (number.number == 0) {
            browser.storage.local.set({ 'number': 0 });
        }
        var data = Object.keys(await browser.storage.local.get());
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
    //   console.log((data.length-1)/2);
    for (var i = 0; i < (data.length - 1) / 2; i++) {
        var option = document.createElement("option");
        var txt = await browser.storage.local.get('target' + i);
        //   console.log(txt);
        txt = txt['target' + i].toLocaleString();
        option.text = txt;
        option.value = i;
        list.add(option);
    }
}
async function removeDate(num) {
    if (num > -1) {
        browser.storage.local.remove('target' + num);
        browser.storage.local.remove('start' + num);
        var data = await browser.storage.local.get();
        data = Object.entries(data);
        var counter = 0;
        // console.log(data);
        for (var i = 0; i < data.length; i++) {
            var startss = data[i][0].substring(0, 5);
            if (startss === "start" && parseInt(data[i][0].substring(5)) > num) {
                browser.storage.local.set({ ['start' + (parseInt(data[i][0].substring(5)) - 1)]: data[i][1] });
                counter++;
            }
            if (startss === "targe" && parseInt(data[i][0].substring(6)) > num) {
                browser.storage.local.set({ ['target' + (parseInt(data[i][0].substring(6)) - 1)]: data[i][1] });
            }
        }
        if(counter == 0){
            browser.storage.local.set({'number':num-1});
        }
        num = (data.length - 1) / 2;
        browser.storage.local.remove('target' + num);
        browser.storage.local.remove('start' + num);
        populate();
        browser.runtime.sendMessage("draw");

    }
}
async function checkForFinished(){
    var data = await browser.storage.local.get();
    data = Object.entries(data);
    const date = new Date();
  //  var num = await browser.storage.local.get('number');
    for (var i = 0; i < data.length; i++) {
        if(data[i][0].substring(0,6)==='target'){
            if(data[i][1].getTime()+3600000<date.getTime()){
                console.log(data[i][1].getTime());
          //      browser.storage.local.set({'number':data[i][0].substring(6)});
                removeDate(data[i][0].substring(6));   
            }
        }
    }
 //   browser.storage.local.set({'number':num});

}
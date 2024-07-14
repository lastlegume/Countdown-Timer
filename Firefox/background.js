draw();
browser.tabs.onActivated.addListener(() => {
        draw();
});
browser.windows.onFocusChanged.addListener((windowId) => {
    draw();
});
browser.runtime.onMessage.addListener(handleMessage);
function handleMessage(request, sender, sendResponse) {
    setTimeout(draw, 1000);
}
async function draw() {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.width = 31;
    context.height = 31;
    context.beginPath();
    context.arc(16, 16, 15, 0, 2 * Math.PI, false);
    context.fillStyle = 'black';
    context.fill();
    
    try {
        var num = await browser.storage.local.get({ 'number': 0 });
        num = num.number;
        var target = await browser.storage.local.get({ ['target'+num]: new Date(2038, 0, 19, 3, 14) });
        var start = await browser.storage.local.get({ ['start'+num]: new Date(2025, 0, 1) });
    } catch (error) {
        console.log(error);
    }    


    //console.log(d);
    start = start['start'+num];
    target = target['target'+num];
    // console.log(start);
    // console.log(target);
    var timePercent = Math.max((target.getTime()-Date.now())/(target.getTime()-start.getTime()),.000001);
    let angle = 2*Math.PI*(1-timePercent)+(Math.PI/2);
    // console.log(timePercent*2);
    context.beginPath();
    var r = 255*Math.min(1, 2-(timePercent*2));
    var g = 255*Math.min(1, timePercent*2);
    var b = 0;
    context.fillStyle= "rgb("+r+","+g+","+b+")";
    context.moveTo(16,16);
    context.arc(16,16,13, 3*Math.PI/2, Math.PI*2-angle);
    context.lineTo(16, 16);
    context.stroke();
    context.fill();

    browser.browserAction.setIcon({
        imageData: context.getImageData(0, 0, 31, 31)
    });
}
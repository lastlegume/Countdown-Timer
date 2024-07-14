draw();
chrome.tabs.onActivated.addListener(() => {
        draw();
});
chrome.windows.onFocusChanged.addListener((windowId) => {
    draw();
});
chrome.runtime.onMessage.addListener(handleMessage);
function handleMessage(request, sender, sendResponse) {
    setTimeout(draw, 1000);
}
async function draw() {
    const canvas = new OffscreenCanvas(31, 31);
    var context = canvas.getContext('2d');
    context.width = 31;
    context.height = 31;
    context.beginPath();
    context.arc(16, 16, 15, 0, 2 * Math.PI, false);
    context.fillStyle = 'black';
    var start = new Date();
    var target = new Date(2038, 0, 19, 3, 14);
    context.fill();
    var stuff = await chrome.storage.local.get();
    if(Object.values(stuff).length<=1){
            await chrome.storage.local.set({ 'target0': target.getTime() });
            await chrome.storage.local.set({ 'start0': start.getTime() });
            await chrome.storage.local.set({ 'number': 0 });
    }
    try {
        var num = await chrome.storage.local.get('number');
        num = num.number;
        target = await chrome.storage.local.get('target'+num);
        start = await chrome.storage.local.get('start'+num);
    } catch (error) {
        console.log(error);
    }    

    start = start['start'+num];
    target = target['target'+num];

    target = new Date(target);
    start = new Date(start);
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

    chrome.action.setIcon({
        imageData: context.getImageData(0, 0, 31, 31)
    });
}
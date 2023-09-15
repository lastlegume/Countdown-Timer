draw();
chrome.tabs.onActivated.addListener(() => {
        draw();
});
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
        console.log("new");
            await chrome.storage.local.set({ 'target': target.getTime() });
            await chrome.storage.local.set({ 'start': start.getTime() });
    }
    try {
        target = await chrome.storage.local.get('target');
        start = await chrome.storage.local.get('start');
    } catch (error) {
        console.log(error);
    }    


    let d = new Date();

    // console.log(d);
    start = start.start;
    target = target.target;

    target = new Date(target);
    start = new Date(start);
    var timePercent = Math.max((target.getTime()-d.getTime())/(target.getTime()-start.getTime()),.000001);
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
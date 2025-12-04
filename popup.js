document.addEventListener('DOMContentLoaded', () => {

    const savedTime = localStorage.getItem('thugChat_time');


    if (savedTime) document.getElementById("numInp").value = savedTime;
});

document.getElementById("applyBtn").addEventListener("click", () => {

    const textVal = document.getElementById("textInp").value;
    const numVal = parseInt(document.getElementById("numInp").value) || 1000;
    const showLog = document.getElementById("showLog");



    localStorage.setItem('thugChat_time', numVal);

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, (tabs) => {
        const activeTab = tabs[0];


        if (!activeTab.url || !activeTab.url.includes("meet.google.com")) {
            if (showLog) showLog.innerHTML = "Not a Google Meet tab. stopping.";
            document.getElementById("applyBtn").innerText = "Only works on Meet!";
            return;
        }

        // injection script
        chrome.scripting.executeScript({
            target: {
                tabId: activeTab.id
            },
            function: start,
            args: [textVal, numVal]
        });
    });
});

// injection function
function start(message, intervalTime) {

    let logger = document.getElementById("my-extension-logger");

    if (!logger) {
        logger = document.createElement("div");
        logger.id = "my-extension-logger";

        // styling log container
        Object.assign(logger.style, {
            position: "fixed",
            top: "10px",
            left: "10px",
            backgroundColor: "rgba(0,0,0,0.9)",
            color: "red",
            padding: "10px",
            borderRadius: "5px",
            zIndex: "10000",
            minWidth: "200px",
            fontFamily: "monospace",
            textAlign: "center",
            border: "2px solid red"
        });

        document.body.appendChild(logger);
    }


    logger.innerHTML = `<div style="color: white; font-weight: bold; margin-bottom: 5px;">AUTO SENDER RUNNING</div>`;


    const stopBtn = document.createElement("button");
    stopBtn.innerText = "STOP";
    Object.assign(stopBtn.style, {
        backgroundColor: "red",
        color: "white",
        border: "none",
        padding: "5px 15px",
        cursor: "pointer",
        marginBottom: "10px",
        fontWeight: "bold"
    });
    logger.appendChild(stopBtn);


    const logContent = document.createElement("div");
    logContent.style.textAlign = "left";
    logContent.style.fontSize = "12px";
    logContent.style.whiteSpace = "nowrap";
    logger.appendChild(logContent);


    function addLog(text) {
        logContent.innerText = `> ${text}`;
    }

    addLog(`Sending "${message}" every ${intervalTime}ms`);

    // interval starting
    const intervalId = setInterval(() => {
        const box = document.querySelector("#bfTqV");
        const btn = document.querySelector("button[jsname='SoqoBf']");

        if (box && btn) {
            box.value = message;
            box.dispatchEvent(new Event('input', {
                bubbles: true
            }));
            btn.removeAttribute("disabled");
            btn.click();
            addLog("Sent successfully");
        } else {
            addLog("Error: Box/Button not found");
        }
    }, intervalTime);

    // interval stopping and logger gone
    stopBtn.addEventListener("click", () => {
        clearInterval(intervalId);
        stopBtn.innerText = "STOPPED";
        stopBtn.style.backgroundColor = "grey";
        addLog("--- STOPPED BY USER ---");
        logger.remove()
    });
}
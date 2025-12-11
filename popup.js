const applyBtn = document.getElementById("applyBtn");

document.addEventListener('DOMContentLoaded', () => {

    const savedTime = localStorage.getItem('thugChat_time');



    if (savedTime) document.getElementById("numInp").value = savedTime;
});

applyBtn.addEventListener("click", () => {

    const textVal = document.getElementById("textInp").value;
    const numVal = parseInt(document.getElementById("numInp").value) || 1000;
    const showLog = document.getElementById("showLog");



    localStorage.setItem('thugChat_time', numVal);

    if (textVal && textVal.trim() !== "" && numVal >= 100) {
        // this is how to get chrome tabs in extension
        chrome.tabs.query({
            active: true,
            currentWindow: true
            // query second arg is function we can collect tabs
        }, (tabs) => {
            const activeTab = tabs[0];


            if (!activeTab.url || !activeTab.url.includes("meet.google.com") && !activeTab.url.includes("app.zoom")) {
                if (showLog) showLog.innerHTML = "Not a Google Meet or zoom tab. stopping.";
                document.getElementById("applyBtn").innerText = "Only works on Meet and zoom!";
                return;
            }
            // this is how we can enter the current site we open in the tab
            // injection script
            chrome.scripting.executeScript({
                target: {
                    tabId: activeTab.id
                },
                // here we add function that seperate from the extension and the cant see each other variables!!
                function: start,
                // this the arguments of the function we should pass to that like this
                args: [textVal, numVal]
            });
        });
    } else {
        if (showLog) showLog.innerHTML = "Invalid input. or your interval below 100ms!!";
    }
});

// injection function
function start(message, intervalTime) {
    // debugger

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
        // conditionally appending the logger to iframe or body in zoom
        if (location.href.includes("zoom")) {
            const iframe = document.querySelector("iframe.pwa-webclient__iframe");
            const iframeDoc = iframe ? iframe.contentDocument : null;
            if (iframeDoc) {
                iframeDoc.body.appendChild(logger);
            } else {
                document.body.appendChild(logger);
            }

        } else {
            document.body.appendChild(logger);
        }
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
        logContent.innerText = text;
    }

    addLog(`Sending "${message}" every ${intervalTime}ms`);

    if (window.intervalId)
        clearInterval(window.intervalId);
    // if chatbox is closed it will open by it self
    switch (true) {
        case location.href.includes("meet.google.com"): {
            if (document.querySelector("button[data-panel-id='2']") && document.querySelector("button[data-panel-id='2']").getAttribute("aria-expanded") === "false")
                document.querySelector("button[data-panel-id='2']").click()

            // interval starting
            window.intervalId = setInterval(() => {
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
            break;
        }
        case location.href.includes("zoom"): {
            const iframe = document.querySelector("iframe.pwa-webclient__iframe");
            const iframeDoc = iframe ? iframe.contentDocument : null;
            // if zoom was in iframe
            if (iframeDoc) {


                const chatContainer = iframeDoc.querySelector("#wc-container-right");


                if (chatContainer && chatContainer.style.visibility === "hidden") {
                    const openBtn = iframeDoc.querySelector("div.footer-chat-button>button");
                    if (openBtn) openBtn.click();
                }


                window.intervalId = setInterval(() => {

                    const input = iframeDoc.querySelector("div.tiptap>p");
                    const sendBtn = iframeDoc.querySelector("button.chat-rtf-box__send");

                    if (input && sendBtn) {
                        input.innerText = message;
                        input.dispatchEvent(new Event('input', {
                            bubbles: true
                        }));

                        sendBtn.removeAttribute("disabled");
                        sendBtn.click();
                        addLog("Sent successfully");
                    } else {
                        addLog("Error: Box/Button not found inside iframe");
                    }
                }, intervalTime);

            } else {
                console.log("Could not find iframe or access was blocked (Cross-Origin).");
            }
            // if zoom was not in iframe
            if (!iframeDoc) {
                const chatContainer = document.querySelector("#wc-container-right");
                if (chatContainer.style.visibility === "hidden")
                    document.querySelector("div.footer-chat-button>button").click()
                window.intervalId = setInterval(() => {
                    const input = document.querySelector("div.tiptap>p")
                    const sendBtn = document.querySelector("button.chat-rtf-box__send")

                    if (input && sendBtn) {
                        input.innerText = message;
                        input.dispatchEvent(new Event('input', {
                            bubbles: true
                        }));
                        sendBtn.removeAttribute("disabled");
                        sendBtn.click();
                        addLog("Sent successfully");
                    } else {
                        addLog("Error: Box/Button not found");
                    }
                }, intervalTime);
            }

            break;


        }
    }


    // interval stopping and logger gone
    stopBtn.addEventListener("click", () => {
        clearInterval(window.intervalId);
        window.intervalId = null;
        stopBtn.innerText = "STOPPED";
        stopBtn.style.backgroundColor = "grey";
        addLog("--- STOPPED BY USER ---");
        logger.remove()
    });
}

// const chatBtn = document.querySelector("div.footer-chat-button>button")
// undefined
// chatBtn.click()
// undefined
// const input = document.querySelector("div.tiptap>p")
// undefined
// input.innerText=mamad

// input.innerText="mamad"
// "mamad"
// const sendBtn = document.querySelector("button.chat-rtf-box__send")
// undefined
// sendBtn.click()
// undefined 
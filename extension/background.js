chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
    const reviews = message.reviews.join(" ");

    run(reviews).then((consensus) => {
        sendResponse({consensus: consensus});
    });

     return true;  
});

async function run(reviews){
    const response = await fetch('https://your-vercel-url.vercel.app/api/generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews: reviews })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
}

// Node 18+ native fetch
const _fetch = global.fetch;

async function checkTDK(word) {
    try {
        const url = `https://sozluk.gov.tr/gts?ara=${encodeURIComponent(word)}`;
        console.log(`Checking: ${url}`);
        const response = await fetch(url);
        const data = await response.json();

        console.log(`Result for '${word}':`, JSON.stringify(data).substring(0, 100) + "...");

        if (Array.isArray(data) && data.length > 0) {
            return true;
        }
        return false;
    } catch (e) {
        console.error("Error:", e);
        return false;
    }
}

(async () => {
    console.log("n:", await checkTDK("n"));
    console.log("N:", await checkTDK("N"));
    console.log("f:", await checkTDK("f"));
    console.log("o:", await checkTDK("o"));
})();

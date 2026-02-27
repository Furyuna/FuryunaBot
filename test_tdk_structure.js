// Node 18+ native fetch
const _fetch = global.fetch;

async function checkTDK(word) {
    try {
        const url = `https://sozluk.gov.tr/gts?ara=${encodeURIComponent(word)}`;
        const response = await fetch(url);
        const data = await response.json();

        // Print full details for inspection
        console.log(`\n=== DETAILS FOR '${word}' ===`);
        if (Array.isArray(data) && data.length > 0) {
            data.forEach((entry, i) => {
                console.log(`ENTRY #${i + 1}:`);
                if (entry.anlamlarListe) {
                    entry.anlamlarListe.forEach((anlam, index) => {
                        console.log(`  ${index + 1}. ${anlam.anlam} (Ozellik: ${JSON.stringify(anlam.ozelliklerListe)})`);
                    });
                }
            });
        } else {
            console.log("Not found.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

(async () => {
    await checkTDK("n");
    await checkTDK("o");
    await checkTDK("a");
    await checkTDK("elma");
})();

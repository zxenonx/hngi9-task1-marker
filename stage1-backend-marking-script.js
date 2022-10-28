// Urls submitted from Interns (can be gotten from CSV, googlesheets, etc...)
// const __urls = [
//     // These are mock urls
//     "https://633dd6017e19b1782916d0d5.mockapi.io/about-me/1",
//     "https://6355ac32483f5d2df3b86de1.mockapi.io/about-fail2/1",
//     "https://633dd6017e19b1782916d0d5.mockapi.io/about-me/2",
//     "https://633dd6017e19b1782916d0d5.mockapi.io/about-me/3",
//     "https://633dd6017e19b1782916d0d5.mockapi.io/about-me/4",
//     "https://633dd6017e19b1782916d0d5.mockapi.io/about-me/5",
//     "https://633dd6017e19b1782916d0d5.mockapi.io/about-me/10",
//     "https://633dd6017e19b1782916d0d5.mockapi.io/about-me/15",
//     "https://633dd6017e19b1782916d0d5.mockapi.io/about-me/30",
// ];

// To store passed and failed tests slack usernames
const slackUsernamesThatPassedTheTest = [];
const slackUsernamesThatFailedTheTest = [];

// Script to check urls
const runScript = async (urls) => {
    // Loop through URLs to assess the endpoints
    for (let index = 0; index < urls.length; index++) {
        const singleUrl = urls[index];

        // Fetch Url and check
        try {
            const data = await fetch(singleUrl).then((response) =>
                response.json()
            );

            // Sample Response with Datatype to Check --- { "slackUsername": String, "backend": Boolean, "age": Integer, "bio": String }
            const { slackUsername, backend, age, bio, id } = data;

            if (
                typeof slackUsername !== "string" ||
                typeof backend !== "boolean" ||
                typeof age !== "number" ||
                typeof bio !== "string"
            ) {
                // Store username and the API response
                slackUsernamesThatFailedTheTest.push([
                    slackUsername,
                    backend,
                    age,
                    bio,
                    id,
                ]);
                // continue to next loop iteration
                continue;
            }
            // If all checks above are correct, add the slackUserName to slackUsernamesThatPassedTheTest and the API response.
            slackUsernamesThatPassedTheTest.push([
                slackUsername,
                backend,
                age,
                bio,
                id,
            ]);
            console.log({
                slackUsernamesThatFailedTheTest,
                slackUsernamesThatPassedTheTest,
            });
        } catch (error) {
            console.log({ error });
        }
    }

    // Download the slackUsernames to a file
    downloadToCSV(slackUsernamesThatPassedTheTest, "passed-interns");
    downloadToCSV(slackUsernamesThatFailedTheTest, "failed-interns");
};

// reuseable function to download CSV
const downloadToCSV = (data, filename) => {
    // To download the result as csv
    const csvContent =
        "data:text/csv;charset=utf-8," +
        data.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
};

// function to read csv file
const readFile = (input) => {
    let file = input.files[0];
    let fileReader = new FileReader();

    fileReader.readAsText(file);

    fileReader.onload = function () {
        console.log(fileReader.result);
        const text = fileReader.result;
        processCSV(text);
    };

    fileReader.onerror = function () {
        alert(fileReader.error);
    };
};

// process csv extra the last column; expected to be url column
const processCSV = async (strng, delim = ",") => {
    const rows = strng.split("\n"); // retrieve rows

    const submissionUrls = rows.map((row) => {
        let value = row.split(delim);
        return value[value.length - 1]; // last item in the arr
    });

    await runScript((urls = submissionUrls)); // trigger script
};

(async function () {
    readFile();
})();

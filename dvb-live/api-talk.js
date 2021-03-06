function debug(debugText) {
    document.getElementById("debug").innerHTML = debugText;
}

function getDMWithStopID(stopid) {
    let xhr = new XMLHttpRequest();

    function buildTableBodyHTML(responseText) {
        let body = "";
        responseText["Departures"].forEach(e => {
            let departuretime;

            if (e.hasOwnProperty("RealTime")) {
                departuretime = e["RealTime"];
            } else {
                departuretime = e["ScheduledTime"];
            }

            let mot = e["Mot"];
            switch(mot) {
                case "CityBus":
                    mot = "<i class='fa-solid fa-bus' title='CityBus'></i>";
                    break;
                case "Tram":
                    mot = "<i class='fa-solid fa-train-tram' title='Tram'></i>";
                    break;
                case "PlusBus":
                    mot = "<i class='fa-solid fa-bus' title='PlusBus'></i>";
                    break;
                case "SuburbanRailway":
                    mot = "<i class='fa-solid fa-train-subway' title='SuburbanRailway'></i>";
                    break;
                case "Train":
                    mot = "<i class='fa-solid fa-train' title='Train'></i>";
                    break;
                case "IntercityBus":
                    mot = "<i class='fa-solid fa-bus' title='IntercityBus'></i>";
                    break;
                default:
            }

            body += "<tr>";
            body += "<td>" + mot + "</td>";
            body += "<td>" + e["LineName"] + "</td>";
            body += "<td>" + e["Direction"] + "</td>";
            body += "<td>" + Math.ceil((new Date(parseInt(departuretime.substr(6)))-Date.now())/100000) + "</td>";
            body += "</tr>";
        });
        return body;
    }

    function onload() {
        document.getElementById("output").innerHTML = "";
        let tablebody = buildTableBodyHTML(JSON.parse(xhr.responseText));
        document.getElementById("output").innerHTML = tablebody;
    }

    function setUpXHR(URL) {
        xhr.open("POST", URL);

        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    
        xhr.onload = onload;
    }

    setUpXHR("https://webapi.vvo-online.de/dm");

    let JSONQuery = `{
        "stopid": ` + stopid + `,
        "limit": 8
    }`;

    xhr.send(JSONQuery);
}

function queryByNameIdeome(ideome) {
    let xhr = new XMLHttpRequest();

    function onload() {
        let response = JSON.parse(xhr.responseText);
        let points = response["Points"];
        let stop = points[0].split("|");
        let stopName = stop[3];
        let stopID = stop[0];
        document.getElementById("station").innerHTML = stopName;
        getDMWithStopID(stopID);
    }

    function setUpXHR(URL) {
        xhr.open("POST", URL);

        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    
        xhr.onload = onload;
    }

    setUpXHR("https://webapi.vvo-online.de/tr/pointfinder");

    let JSONQuery = `{
        "query":` + ideome + `,
        "stopsOnly": true,
        "regionalOnly": true
    }`

    xhr.send(JSONQuery);
}
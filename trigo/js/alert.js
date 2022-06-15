function showAlert(alert) {
    let alerts = document.getElementById("alerts");
    let alertPar = document.createElement("div");
    alertPar.className = "alert";
    alertPar.innerHTML = alert;
    alerts.appendChild(alertPar);
    return alertPar;
}

function clearAlerts() {
    document.getElementById("alerts").innerHTML = "";
}
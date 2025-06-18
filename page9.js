const populateSummary = (summaryNode, Invoice) => {
    console.log(newInvoice.testsAmount)
    newInvoice.invoiceTotal= parseFloat(Number(newInvoice.dailyActionsAmount)+Number(newInvoice.panelsAmount)+Number(newInvoice.covidAmount) + Number(newInvoice.testsAmount) + Number(newInvoice.customAmount)).toFixed(2)
    let panelHours = 0
    let covidHours = 0
    let dailyInvoiceAmount = 0
    let providerInvoiceAmount = 0
    let covidInvoiceAmount = 0
    let otherInvoiceAmount = 0
    let invoiceAmount = 0
    
    let summaryHTML = `<div class="section-two">
    <div class="left-div">
        <div class="left-div-top">
            <b>Invoice Summary</b>
        </div>
        <div class="left-div-bottom">
            <table>
                <thead>
                    <tr>
                        <th class="first-table-column"></th>
                        <th>Daily Actions</th>
                        <th>Panels</th>
                        <th>COVID</th>
                        <th>Tests</th>
                        <th class="last-table-column">Other</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th class="first-table-column">Hours</th>
                        <td id="daily-Action-Hours-Table">${newInvoice.dailyActionHours}</td>
                        <td id="panel-Hours-Table">${newInvoice.providerHours}</td>
                        <td id="covid-Hours-Table">${newInvoice.covidHours}</td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <th class="first-table-column last-table-row">Amount</th>
                        <td class="last-table-row" id="dailyAmount">$${newInvoice.dailyActionsAmount}</td>
                        <td class="last-table-row" id="provider-amount">$${newInvoice.panelsAmount}</td>
                        <td class="last-table-row" id="covid-amount">$${newInvoice.covidAmount}</td>
                        <td class="last-table-row">$${newInvoice.testsAmount}</td>
                        <td class="last-table-row">$${newInvoice.customAmount}</td>
                </tbody>
            </table>
        </div>
    </div>
    <div class="right-div">
        <div class="right-div-top border-2">
            <div><b class="section-two-title">Total Invoice Amount</b></div>
            <div class="invoice-amount" id="totalInvoice">$${newInvoice.invoiceTotal}</div>
        </div>

    </div>
</div>`

    summaryNode.innerHTML = summaryHTML
}

let getHeaderInfo = async (queryString) => {
    const urlParams = new URLSearchParams(queryString);
    let dailyActionsIncluded = " "
    let covidActionsIncluded = " "
    let panelsIncluded = " "
    let testsIncluded = " "
    let claimsOptions = urlParams.get("caseopt")
    let invoiceTitle = urlParams.get("title")
    let invoiceDate = new Date().toLocaleDateString()
    let isParent = " ";
    let fateDecide = ""
    let clientID = urlParams.get("clientid")
    let parentId = urlParams.get("parentid");
    let clientName = urlParams.get("clientname");


    let dailysBox = document.getElementById("daily-actions-box")
    let covidBox = document.getElementById("covid-box")
    let panelsBox = document.getElementById("providers-box")
    let testsBox = document.getElementById("tests-box")
    let claimsNode = document.getElementById("claims-option")
    let titleNode = document.getElementById("invoice-title")
    let parentNode = document.getElementById("is-parent")
    let dateNode = document.getElementById("date-of-invoice")
    let clientNameNode = document.getElementById("client-name")

    if (urlParams.get("cases") == 1) {
        dailyActionsIncluded = "X"
    }
    if (urlParams.get("covid") == 1) {
        covidActionsIncluded = "X"
    }
    if (urlParams.get("panels") == 1) {
        panelsIncluded = "X"
    }
    if (urlParams.get("tests") > 0) {
        testsIncluded = "X"
    }
    if (clientID !== "") {
        fateDecide = `'16'.EX.${clientID}`
    } else {
        fateDecide = `'23'.EX.${parentId}`
        isParent = "X"
    }

    dailysBox.innerHTML = dailyActionsIncluded
    covidBox.innerHTML = covidActionsIncluded
    panelsBox.innerHTML = panelsIncluded
    testsBox.innerHTML = testsIncluded
    titleNode.innerHTML = invoiceTitle
    claimsNode.innerHTML = claimsOptions
    parentNode.innerHTML = isParent
    dateNode.innerHTML = invoiceDate
    clientNameNode.innerHTML = clientName
}


let getContractInfo = async (parentId, clientId, Contract) => {
    let billingFrequency = document.getElementById("billing-frequency")

    if (clientID !== "") {
        fateDecide = `'16'.EX.${clientID}`
    } else {
        fateDecide = `'23'.EX.${parentId}`
    }
    let contractArrayOfClient = await get_records("axisrisk.quickbase.com", "bu5h2c6n7", "3pegtdbzqzzu7b4kuhjv43v4td", [7, 9, 20, 21, 26, , 27, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 41, 42, 43, 45, 46, 51, 52, 53, 55, 60, 61, 62,73], `{${fateDecide}} AND {'10'.EX.'true'}`)
    let contractData = contractArrayOfClient.data[0]
    console.log(contractData)

    Contract.billingFrequency = contractData["33"].value
    Contract.dailytmRate = contractData["21"].value
    Contract.dailyContractType = contractData["20"].value
    Contract.dailyOverageRate = contractData["32"].value
    Contract.dailyAnnualFlatRate = contractData["7"].value
    Contract.dailyAnnualHours = contractData["29"].value
    Contract.covidContractType = contractData["34"].value
    Contract.covidtmRate = contractData["35"].value
    Contract.covidOverageRate = contractData["41"].value
    Contract.covidAnnualFlatRate = contractData["9"].value
    Contract.covidAnnualHours = contractData["36"].value
    Contract.covidHoursUsed = contractData["46"].value
     Contract.dailyAnnualHoursUsed =contractData["73"].value
    billingFrequency.innerHTML = contractData["33"].value
    Contract.biannualContractInitial=contractData["51"].value
    Contract.biannualContractMid=contractData["52"].value
    Contract.biannualContractFinal=contractData["53"].value
    Contract.biannualNumInvoices = contractData["55"].value
	




}

let getCustomLines = async (str) => {
    const urls = new URLSearchParams(str);
    const rid = urls.get("rid")
    let totalCost = 0
    let hostName = "axisrisk.quickbase.com"
    let tableId = "bu5h2c6md"
    let appToken = "3pegtdbzqzzu7b4kuhjv43v4td"
    let fidArr = [20]
    let queryParam = `{'15'.EX.${rid}}AND{'6'.EX.'Custom'}`
    let getAllCustomFeeData = await get_records(hostName, tableId, appToken, fidArr, queryParam)
    console.log(getAllCustomFeeData)
    getAllCustomFee = getAllCustomFeeData.data
    getAllCustomFee.forEach(el => {
        totalCost += el["20"].value
    })
    newInvoice.customAmount=totalCost
    return totalCost


}
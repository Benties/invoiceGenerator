const populateProviderPanels = async (invoice, ProviderPanelNode) => {


    let modalString = `<div class= "mm-header-container grid grid-cols-5">
                        <p class="px-2.5 text-center">Date</p>
                        <p class="px-2.5 text-center">Job Number</p>
                        <p class="px-2.5 text-center">Job Name</p>
                        <p class="px-2.5 text-center">Time Spent</p>
                        <p class="px-2.5 text-center">Remove</p>
                        </div>`

    invoice.providerArray.forEach(line => {
        modalString += `<div class="grid grid-cols-5" id=${line["3"].value}>
				<p class="px-2.5 text-center">${line["8"].value}</p>
				<p class="px-2.5 text-center">${line["12"].value}</p>
				<p class="px-2.5 text-center">${line["10"].value}</p>
				<p class="px-2.5 text-center">${line["6"].value}</p>
				<button class="trash-button px-2.5 text-center" onClick="getTrashed(this, 'provider panel')">&#128465;&#65039;</button>
				</div>`

    })

    ProviderPanelNode.innerHTML =
        `
    <div class="mm-left-div-bottom overflow-y-auto max-h-96">
	${modalString}
    </div>
    `

}

const getProviderPanels = async (parentId, clientId, Invoice) => {
    let totalHours = 0
    let hostName = "axisrisk.quickbase.com"
    let tableId = "bu5h2c7ej"
    let appToken = "3pegtdbzqzzu7b4kuhjv43v4td"
    let fidArr = [3, 6, 7, 8, 9, 10, 11, 12, 14, 13]
    let queryParam = ""
    let extraDailyQuery = ""

    if (parentId !== "" && parentId > 0) {
        queryParam = `{'17'.EX.${parentId}}AND{'8'.OAF.'6/15/23'} AND {'13'.EX.'Complete'}`
    } else {
        queryParam = `{'11'.EX.${clientId}}AND{'8'.OAF.'6/15/23'} AND {'13'.EX.'Complete'}`
    }


    let providerData = await get_records(hostName, tableId, appToken, fidArr, queryParam, [{ "fieldId": 10, "order": "ASC" }])

    providerData.data.forEach(el => {
        totalHours += el["6"].value;
    })

    let floatTotalHours = parseFloat(totalHours).toFixed(2)
    console.log({providerPanels: providerData.data})
    Invoice.providerHours = floatTotalHours
    Invoice.providerArray = providerData.data
    return [floatTotalHours, providerData.data];


}

let getProviderTotal = async (Invoice, Contract) => {

    let providerActTot = 0;
    let totHours = Number(Invoice.providerHours)
    console.log(Contract.dailyAnnualHoursUsed,Contract.dailyAnnualHours , "Here are your Hours")
    let providerAdditionalCost = 0;

    switch (Contract.dailyContractType) {
        case "Straight T&M":
            providerActTot = parseFloat(totHours * Contract.dailytmRate).toFixed(2)
            break;
        case "Do Not Exceed":

            if (Contract.dailyAnnualHours - (Contract.dailyAnnualHoursUsed + Number(totHours)) >= 0) {

               providerActTot = parseFloat(totHours * Contract.dailytmRate).toFixed(2)
            } else if (Contract.dailyAnnualHours - Contract.dailyAnnualHoursUsed >= 0) {

                let regCostHours = Contract.dailyAnnualHours - Contract.dailyAnnualHoursUsed
                let overCost = Number(totHours) - regCostHours

                providerActTot = parseFloat(regCostHours * Contract.dailytmRate + overCost * Contract.dailyOverageRate).toFixed(2)
            } else {
                providerActTot = parseFloat(totHours * Contract.dailyOverageRate).toFixed(2)
            }
            break;
        case "Fixed Fee":
                providerActTot = 0
            break;
        case "Fixed Fee Plus":
            dailyActionAdditionalCost = parseFloat(totHours * Contract.dailytmRate).toFixed(2)
            providerActTot = Number(providerActTot) + Number(providerAdditionalCost);
            break;
        case "DNE Fixed Fee":
            if (Contract.dailyAnnualHours - (Contract.dailyAnnualHoursUsed + Number(totHours) + Number(newInvoice.dailyActionHours)) >= 0) {
                providerActTot = 0
            } else if (Contract.dailyAnnualHours - (Contract.dailyAnnualHoursUsed + Number(totHours) + Number(newInvoice.dailyActionHours)) < 0) {
                let overage = 0
                if (Number(Contract.dailyAnnualHoursUsed)+Number(newInvoice.dailyActionHours) > Contract.dailyAnnualHours) {
                    overage = parseFloat(Contract.dailyOverageRate * Number(totHours)).toFixed(2)
                } else {
                    overage = parseFloat(Contract.dailyOverageRate * ((Contract.dailyAnnualHoursUsed + Number(totHours)+ Number(newInvoice.dailyActionHours)) - Contract.dailyAnnualHours)).toFixed(2)
                }
                providerActTot = parseFloat(overage).toFixed(2)
            }
	    break;

    }
    console.log(providerActTot, "Provider TOTAL")
    Invoice.panelsAmount = providerActTot
    return providerActTot;

}

/*
let getTrashed = (elem, str) => {
    let badCard;
    let parentId = elem.parentElement.id;
     badCard = document.getElementById(parentId);

    if(str==="daily action"){
    let foundIndex = newInvoice.dailyActionsArray.findIndex((element) => element["3"].value == parentId)
    newInvoice.dailyActionHours = parseFloat(newInvoice.dailyActionHours-parseFloat(newInvoice.dailyActionsArray[foundIndex]["48"].value).toFixed(2)).toFixed(2)
    newInvoice.dailyActionsArray.splice(foundIndex, 1)
    getDailyTotal(newInvoice,newContract)
    }else if(str==="tests"){
    let foundIndex = newInvoice.testsArray.findIndex((element) => element["3"].value == parentId)
    newInvoice.testsAmount = newInvoice.testsArray[foundIndex]["34"]?parseFloat(newInvoice.testsAmount-parseFloat(newInvoice.testsArray[foundIndex]["34"].value).toFixed(2)).toFixed(2):newInvoice.testsAmount
    newInvoice.testsArray.splice(foundIndex, 1)
    }

    badCard.remove();


};*/

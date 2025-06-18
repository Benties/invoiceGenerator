const populateDailyActions = async (invoice, dailyActionNode) => {


    let modalString = `<div class="mm-div-container mm-header-container grid grid-cols-7 dailyActionLines">
                        <p class="px-2.5 text-center">Date</p>
                        <p class="px-2.5 text-center">Patient</p>
                        <p class="px-2.5 text-center">Job Name</p>
                        <p class="px-2.5 text-center">State</p>
                        <p class="px-2.5 text-center">Outcome</p>
                        <p class="px-2.5 text-center">Time Spent(Min)</p>
                        <p class="px-2.5 text-center">Remove</p>
                        </div>`

    invoice.forEach(line => {
        modalString += `<div class="mm-div-container grid grid-cols-7 dailyActionLines" id=${line["3"].value}>
				<p class="px-2.5 text-center">${line["8"].value}</p>
				<p class="px-2.5 text-center">${line["22"].value}</p>
				<p class="px-2.5 text-center">${line["14"].value}</p>
				<p class="px-2.5 text-center">${line["16"].value}</p>
				<p class="px-2.5 text-center">${line["44"].value}</p>
				<p class="px-2.5 text-center">${parseFloat(line["48"].value).toFixed(2)}</p>
				<button class="trash-button px-2.5 text-center" onClick="getTrashed(this, 'daily action')">&#128465;&#65039;</button>
				</div>`

    })

    dailyActionNode.innerHTML =
        `
    <div class="mm-left-div-bottom overflow-y-auto  max-h-96" id="dailyActionInnerContent">
        <div id="search-div" class="grid grid-cols-7 p-5">
		   <div class="calender-div px-2.5 gap-2">
                    <input class="calendar-stuff" type="date" id="start-date" onchange="findTheDailyActionsArray(tabContent)">

                    <input class="calendar-stuff" type="date" id="end-date" onchange="findTheDailyActionsArray(tabContent)">

                </div>
		<div class="px-2.5 flex justify-center">
                <select id="patient-dropdown" onchange="findTheDailyActionsArray(tabContent)">
                    <option value="">-Select One-</option>
                </select>
                </div>
                <div class="px-2.5 flex justify-center">
                    <input placeholder="Enter Job Name" class="search-feature" type="text" id="job-search" onchange="findTheDailyActionsArray(tabContent)">
                </div>
                <div class="px-2.5 flex justify-center">
                    <select class="search-feature" id="state-search"  onchange="findTheDailyActionsArray(tabContent)">
                      <option value="">-Select One-</option>
                    </select>
                </div>
	         <div class="px-2.5"></div>
		<div class="px-2.5"></div>
		<div class="px-2.5"></div>
            </div>
	${modalString}
    </div>
    `
    let stateSearch = document.getElementById("state-search")
    let stateArray = getStates(invoice)
            stateArray.forEach(state => {
                let tempOption = document.createElement("option")
                tempOption.value = state;
                tempOption.innerHTML = state
                stateSearch.append(tempOption)
            })
    let patientSearch = document.getElementById("patient-dropdown")
    let patientArray = getPatients(invoice)
            patientArray.forEach(patient => {
                let tempOption = document.createElement("option")
                tempOption.value = patient;
                tempOption.innerHTML = patient
                patientSearch.append(tempOption)
            })

}

const populateDailyActionsAndSummary = async (parentId, clientId, claimsOptions, Invoice) => {
    let totalHours = 0
    let hostName = "axisrisk.quickbase.com"
    let tableId = "bu5h2c8wk"
    let appToken = "cehhhhtbxdcfj8djhtvf8cc848w2"
    let fidArr = [3, 64, 13, 22, 14, 65, 50, 8, 48, 44, 16, 66]
    let queryParam = ""
    let extraDailyQuery = ""
    console.log("We are in the function")
    if (claimsOptions === "Claims Only") {
        extraDailyQuery = "AND {50.XEX.''}"
    } else if (claimsOptions === "Don't Include Claims") {
        extraDailyQuery = "AND {50.EX.''}"
    } else {
        extraDailyQuery = ""
    }
    if (parentId !== "" && parentId > 0) {
        queryParam = `({'82'.EX.${parentId}}OR({'82'.XCT.${parentId}}AND{'68'.EX.${parentId}}))${extraDailyQuery}AND{'8'.OAF.'6/1/23'} AND {'9'.EX.'Closed'}AND{'66'.EX.'false'}`
    } else {
        queryParam = `({'81'.EX.${clientId}}OR({'81'.XCT.${clientId}}AND{'64'.EX.${clientId}}))${extraDailyQuery}AND{'8'.OAF.'6/1/23'} AND {9.EX.'Closed'} AND{'66'.EX.'false'}`
    }


    let dailyHoursData = await get_records(hostName, tableId, appToken, fidArr, queryParam)

    dailyHoursData.data.forEach(el => {
        totalHours += el["48"].value;
    })

    let floatTotalHours = parseFloat(totalHours).toFixed(2)
    console.log({dailyActions: dailyHoursData.data})
    Invoice.dailyActionHours = floatTotalHours
    Invoice.dailyActionsArray = dailyHoursData.data
    return [floatTotalHours, dailyHoursData.data];


}

let getDailyTotal = async (Invoice, Contract) => {

    let dailyActTot = 0;
    let totHours = Number(Invoice.dailyActionHours)
    console.log(Contract.dailyAnnualHoursUsed,Contract.dailyAnnualHours , "Here are your Hours")
    let dailyActionAdditionalCost = 0;

    switch (Contract.dailyContractType) {
        case "Straight T&M":
            dailyActTot = parseFloat(totHours * Contract.dailytmRate).toFixed(2)
            break;
        case "Do Not Exceed":

            if (Contract.dailyAnnualHours - (Contract.dailyAnnualHoursUsed + Number(totHours)) >= 0) {

                dailyActTot = parseFloat(totHours * Contract.dailytmRate).toFixed(2)
            } else if (Contract.dailyAnnualHours - Contract.dailyAnnualHoursUsed >= 0) {

                let regCostHours = Contract.dailyAnnualHours - Contract.dailyAnnualHoursUsed
                let overCost = Number(totHours) - regCostHours

                dailyActTot = parseFloat(regCostHours * Contract.dailytmRate + overCost * Contract.dailyOverageRate).toFixed(2)
            } else {
                dailyActTot = parseFloat(totHours * Contract.dailyOverageRate).toFixed(2)
            }
            break;
        case "Fixed Fee":
            if (Contract.billingFrequency === "Monthly") {
                dailyActTot = parseFloat(Contract.dailyAnnualFlatRate / 12).toFixed(2)
            } else if (Contract.billingFrequency === "Quarterly") {
                dailyActTot = parseFloat(Contract.dailyAnnualFlatRate / 4).toFixed(2)
            } else {
                dailyActTot = Contract.dailyAnnualFlatRate
            }
            break;
        case "Fixed Fee Plus":
            if (Contract.billingFrequency === "Monthly") {
                dailyActTot = parseFloat(Contract.dailyAnnualFlatRate / 12).toFixed(2)
            } else if (Contract.billingFrequency === "Quarterly") {
                dailyActTot = parseFloat(Contract.dailyAnnualFlatRate / 4).toFixed(2)
            } else {
                dailyActTot = Contract.dailyAnnualFlatRate
            }
            dailyActionAdditionalCost = parseFloat(totHours * Contract.dailytmRate).toFixed(2)
            dailyActTot = Number(dailyActTot) + Number(dailyActionAdditionalCost);
            break;
        case "DNE Fixed Fee":
	    console.log(Contract.billingFrequency=="Monthly")
            if (Contract.billingFrequency=="Monthly" && Contract.dailyAnnualHours - (Contract.dailyAnnualHoursUsed + Number(totHours)) >= 0) {
                dailyActTot = parseFloat(Contract.dailyAnnualFlatRate / 12).toFixed(2)
            } else if (Contract.billingFrequency === "Monthly" && Contract.dailyAnnualHours - (Contract.dailyAnnualHoursUsed + Number(totHours)) < 0) {
                let overage = 0
                if (Contract.dailyAnnualHoursUsed > Contract.dailyAnnualHours) {
                    overage = parseFloat(Contract.dailyOverageRate * Number(totHours)).toFixed(2)
                } else {
                    overage = parseFloat(Contract.dailyOverageRate * ((Contract.dailyAnnualHoursUsed + Number(totHours)) - Contract.dailyAnnualHours)).toFixed(2)
                }
                dailyActTot = parseFloat(Number(Contract.dailyAnnualFlatRate / 12) + Number(overage)).toFixed(2)
            } else if (Contract.billingFrequency === "Quarterly" && Contract.dailyAnnualHours - (Contract.dailyAnnualHoursUsed + Number(totHours)) >= 0) {
                dailyActTot = parseFloat(Contract.dailyAnnualFlatRate / 4).toFixed(2)
            } else if (Contract.billingFrequency === "Quarterly" && Contract.dailyAnnualHours - (Contract.dailyAnnualHoursUsed + Number(totHours)) < 0) {
                let overage = 0
                if (Contract.dailyAnnualHoursUsed > Contract.dailyAnnualHours) {
                    overage = parseFloat(Contract.dailyOverageRate * Number(totHours)).toFixed(2)
                } else {
                    overage = parseFloat(Contract.dailyOverageRate * ((Contract.dailyAnnualHoursUsed + Number(totHours)) - Contract.dailyAnnualHours)).toFixed(2)
                }
                dailyActTot = parseFloat(Number(Contract.dailyAnnualFlatRate / 4) + Number(overage)).toFixed(2)
            } else if (Contract.billingFrequency === "Biannually") {
                dailyActTot = doTheBiannualThing(Contract, totHours)
            } else if (Contract.dailyAnnualHours - (Contract.dailyAnnualHoursUsed + Number(totHours)) < 0) {
                let overage = 0
                if (Contract.dailyAnnualHoursUsed > Contract.dailyAnnualHours) {
                    overage = parseFloat(Contract.dailyOverageRate * Number(totHours)).toFixed(2)
                } else {
                    overage = parseFloat(Contract.dailyOverageRate * ((Contract.dailyAnnualHoursUsed + Number(totHours)) - Contract.dailyAnnualHours)).toFixed(2)
                }
                dailyActTot = parseFloat(overage).toFixed(2)
            }
            else {
                dailyActTot = Contract.dailyAnnualFlatRate
            }
	    break;

    }
    console.log(dailyActTot, "DAILY ACTION TOTAL")
    Invoice.dailyActionsAmount = dailyActTot
    return dailyActTot;

}


let doTheBiannualThing = (dataArr, numOfHours) =>{
	let biannualHours = 0;
    	let contractMultiplier = null
   	let totalCost = 0
	if (dataArr.biannualNumInvoices == 0) {
        contractMultiplier = dataArr.biannualContractInitial
    } else if (dataArr.biannualNumInvoices == 1) {
        contractMultiplier = dataArr.biannualContractMid
    } else {
        contractMultiplier = dataArr.biannualContractFinal
    }
    if (dataArr.dailyAnnualHours - (dataArr.dailyAnnualHoursUsed + Number(numOfHours)) >= 0) {
        totalCost = 0
        totalCost = dataArr.dailyAnnualFlatRate * contractMultiplier
    } else {
        totalCost = dataArr.dailyAnnualFlatRate * contractMultiplier
	let overage = 0
        if(dataArr.dailyAnnualHoursUsed >dataArr.dailyAnnualHours){
            overage = dataArr.dailyOverageRate * Number(numOfHours)
	}else{
           overage = dataArr.dailyOverageRate * (Number(numOfHours) - (dataArr.dailyAnnualHours-dataArr.dailyAnnualHoursUsed))
	}
        totalCost = Number(totalCost) + Number(overage)
    }
    return totalCost
}

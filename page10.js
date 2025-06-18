const populateMedicalMonitoring = async (invoice, medicalNode) => {
	let modalString = `<div class="mm-div-container mm-header-container grid grid-cols-7">
				<p class="px-2.5 text-center">Test Type</p>
				<p class="px-2.5 text-center">Test Date</p>
				<p class="px-2.5 text-center">Job Number</p>
				<p class="px-2.5 text-center">Job Name</p>
				<p class="px-2.5 text-center">Patient Name</p>
				<p class="px-2.5 text-center">Fee</p>
				<p class="px-2.5 text-center">Delete</p>
				</div>`


	invoice.testsArray.forEach(line => {

		modalString += `<div class="mm-div-container grid grid-cols-7" id=${line["3"].value}>
				<p class="px-2.5 text-center">${line["6"].value}</p>
				<p class="px-2.5 text-center">${line["10"].value}</p>
				<p class="px-2.5 text-center">${line["50"].value}</p>
				<p class="px-2.5 text-center">${line["51"].value}</p>
				<p class="px-2.5 text-center">${line["24"].value}</p>
				<p class="text-center">$<input class="${line["34"]?' text-center w-8':'text-center bg-red-500 '}" onchange="updateObj(this, this.value)" type = 'number' value ="${ line["34"]?Number(line["34"].value): undefined }" ></p>
				<button class="trash-button px-2.5 text-center" onClick="getTrashed(this, 'tests')">&#128465;&#65039;</button>
				</div > `

    })


    medicalNode.innerHTML =
          `
    <div class="mm-left-div-bottom overflow-y-auto max-h-96">
	${modalString}
    </div>
    `

}

const populateMedicalMonitoringAndSummary = async (Invoice, Contract, qString) => {
        const urlQueries = new URLSearchParams(qString);
	let medicalMonitoring = urlQueries.get("tests");
	let clientID = urlQueries.get("clientid");
	let parentId = urlQueries.get("parentid");
	let totalTestFees = 0
	let testQuery=""
	if (clientID !== "") {
	testQuery = `{23.EX.${ clientID }}OR({23.XCT.${clientID}}AND{40.EX.1})`
    } else {
	testQuery = `{48.EX.${ parentId }} `
    }

	let medicalMonitoringContractInfo = await get_records("axisrisk.quickbase.com", "bu5h2c6q4", "3pegtdbzqzzu7b4kuhjv43v4td", [6,7], `{ '15'.EX.${ medicalMonitoring } } `)
        let getTestData = await get_records("axisrisk.quickbase.com", "bu5h2c94k", "cehhhhtbxdcfj8djhtvf8cc848w2", [3,6,10,23,24,50,51,49], `{ '7'.EX.'Complete' } AND { '49'.EX.'false' }AND {'10'.OAF.'10/1/23'} AND ${ testQuery }`)
	let testData = getTestData.data
	let fees = medicalMonitoringContractInfo.data
	console.log(fees)
	if(fees.length>0){
  	fees.forEach(fee => {
		testData.forEach(singleTest => {
			console.log(fee["6"].value, singleTest["6"].value)
			if(fee["6"].value == singleTest["6"].value){
			totalTestFees+=fee["7"].value
				singleTest["34"]={"value":`${ fee["7"].value } `}
			}
		})


  })
  }


	console.log({medMonitoring: testData})
	Invoice.testsArray=testData
	Invoice.testsAmount=totalTestFees
	return testData

}

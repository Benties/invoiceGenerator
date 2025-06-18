const get_auth = async (tableId, appToken, hostName) => {
    let headers = {
        "QB-Realm-Hostname": `${hostName}`,
        "User-Agent": "{User-Agent}",
        "QB-App-Token": `${appToken}`,
        "Content-Type": "application/json",
    };

    let resAuth = await fetch(`https://api.quickbase.com/v1/auth/temporary/${tableId}`, {
        method: "GET",
        headers,
        credentials: "include",
    })
    let data = await resAuth.json()
    return data['temporaryAuthorization']
}

const get_records = async (hostName, tableId, appToken, fieldsWantedArr, queryParamaters, sorted) => {
    // const tableId = 'bs33fzhhi'
    // const appToken = "ph44qcbbrkmftd3i7fphsnjw76"
    const from = tableId
    const select = fieldsWantedArr
    const where = queryParamaters

    // You will need to add the get_auth function from this repo to your project to use it.
    let auth = await get_auth(tableId, appToken, hostName);

    let headers = {
        'QB-Realm-Hostname': `${hostName}`,
        'User-Agent': '{User-Agent}',
        'Authorization': `QB-TEMP-TOKEN ${auth}`,
        'Content-Type': 'application/json'
    };
    const sortBy = sorted

    let body = { from, select, where, sortBy }


    let res = await fetch('https://api.quickbase.com/v1/records/query', {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });

    let data = await res.json();

    console.log(data)
    return data
};

const post_patch_records = async (hostName, tableId, appToken, dataArr) => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    console.log(urlParams)
    let rid = urlParams.get("rid")
    const to = tableId;
    // dataArr should be an array with objects inside. Each object should contain
    //  "3" : {"value": ${recordIdToUpdate}} 3 being the field value for recordID.
    const data = dataArr;

    let auth = await get_auth(tableId, appToken, hostName);

    let headers = {
        'QB-Realm-Hostname': `${hostName}`,
        'User-Agent': '{User-Agent}',
        'Authorization': `QB-TEMP-TOKEN ${auth}`,
        'Content-Type': 'application/json'
    };

    let body = { to, data }

    let res = await fetch('https://api.quickbase.com/v1/records', {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });

    let response = res.json();

    if (res.ok) {
        return response

    } else {
        let error_code = res.status
        await handle_qb_error(headers, body, data, error_code, response)
        return alert('Something went wrong')
    }
};

const handle_qb_error = async (error_headers, error_body, error_data, error_code, error_response) => {
    let tableId = 'bs4rvnrg2';
    let appToken = 'c3a5y8rc8rfjyfcme8qhwcg9ewdp';
    let hostName = 'saferightfast.quickbase.com'
    let realm = `https://${error_headers['QB-Realm-Hostname']}/db/${error_body["from"]}`
    let code_page_url = window.location.href;
    const body = { error_headers, error_body, error_data, error_response };
    const error = JSON.stringify(body);

    let dataArr = [{ "6": { "value": error }, "8": { "value": error_code }, "9": { "value": code_page_url }, "10": { "value": realm } }]

    let res = await post_patch_records(hostName, tableId, appToken, dataArr);

    return error;
};


const updateObj = (elem, val) => {
	
    let parentId = elem.parentElement.parentElement.id;
    if(val !==undefined){
        console.log(elem)
	elem.classList.remove('bg-red-500')
	let foundIndex = newInvoice.testsArray.findIndex((element) => element["3"].value == parentId)
	newInvoice.testsArray[foundIndex]["34"]={"value":val}
	addTheFees()
    }else{
	elem.classList.add('bg-red-500')
	addTheFees()
    }
  


}

const addTheFees = () => {
	let tempFees =0
	newInvoice.testsArray.forEach(fee => {
		if(fee["34"]){
		tempFees+=Number(fee["34"].value)
		}
	})
	newInvoice.testsAmount = tempFees
}

const revertChanges = () => {

	window.location = window.location.href;

}

const backToSRF = () => {
	const queryS= window.location.search;
	const urlStuff = new URLSearchParams(queryString);
	const recordId = urlPars.get("rid")
 window.location.replace(
                `https://axisrisk.quickbase.com/db/bu5h2c6bg?a=dr&rid=${recordId}`)

}

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
    }else if(str==="provider panel"){
    let foundIndex = newInvoice.providerArray.findIndex((element) => element["3"].value == parentId)
    newInvoice.providerHours = parseFloat(newInvoice.providerHours-parseFloat(newInvoice.providerArray[foundIndex]["6"].value).toFixed(2)).toFixed(2)
    newInvoice.providerArray.splice(foundIndex, 1)
    getProviderTotal(newInvoice, newContract)
    }else if(str==="covid"){
    let foundIndex = newInvoice.covidArray.findIndex((element) => element["3"].value == parentId)
    newInvoice.covidHours = parseFloat(newInvoice.covidHours-parseFloat(newInvoice.covidArray[foundIndex]["20"].value).toFixed(2)).toFixed(2)
    newInvoice.covidArray.splice(foundIndex, 1)
    getCovidTotal(newInvoice, newContract)
    }

    badCard.remove();
    

};

const generateInvoice = async () => {
	let feeCheck = await goodToGo()
	if(feeCheck===false){
		return alert('Not all test fees are filled in')
	}else{
	let realmName = 'axisrisk.quickbase.com'
        let appToken = "3pegtdbzqzzu7b4kuhjv43v4td"
	const rid = urlPars.get("rid")
	if(newInvoice.providerArray.length>0){
		 let panelArr = []

        	newInvoice.providerArray.forEach(el => {
            	let panelObj = { "3": { "value": el["3"].value }, "15": { "value": rid } };
            	panelArr.push(panelObj)
        	})
		let res = await post_patch_records(realmName, "bu5h2c7ej", appToken, panelArr)


	};
	if(newInvoice.dailyActionsArray.length>0 || newInvoice.testsArray.length>0 || newInvoice.covidArray.length>0){
		let datArray = []
		if(newInvoice.dailyActionsArray.length>0){
			newInvoice.dailyActionsArray.forEach(el => {
                	let tempObj = { "15": { "value": rid }, "26": { "value": el["64"].value }, "6": { "value": "Daily Actions" }, "12": { "value": el["48"].value }, "7": { "value": el["22"].value }, "8": { "value": el["65"].value }, "9": { "value": el["14"].value }, "10": { "value": el["8"].value }, "11": { "value": el["44"].value }, "14": { "value": el["50"].value }, "18": { "value": el["3"].value } }
                	datArray.push(tempObj)
            	})
		}
		if(newInvoice.covidArray.length>0){
			  newInvoice.covidArray.forEach(el => {

                	let tempObj = { "15": { "value": rid }, "6": { "value": "Covid" }, "26": { "value": el["23"].value }, "12": { "value": el["20"].value }, "7": { "value": el["14"].value }, "8": { "value": el["16"].value }, "9": { "value": el["17"].value }, "10": { "value": el["8"].value }, "19": { "value": el["3"].value } }
                	datArray.push(tempObj)
            		})
		}
		if(newInvoice.testsArray.length>0){
			newInvoice.testsArray.forEach(el => {
			let tempObj = { "15": { "value": rid }, "17": { "value": el["6"].value }, "26": { "value": el["23"].value }, "6": { "value": "Tests" }, "7": { "value": el["24"].value }, "8": { "value": el["50"].value }, "9": { "value": el["51"].value }, "10": { "value": el["10"].value }, "34": { "value": el["34"].value }, "18": { "value": el["3"].value } }
			datArray.push(tempObj)
			})
			
		}
		
		let thisRes = await post_patch_records(realmName, "bsx6fzztn", appToken, datArray)

	}
	let subtotal = Number(newInvoice.dailyActionsAmount) + Number(newInvoice.covidAmount)+ Number(newInvoice.panelsAmount)+ Number(newInvoice.testsAmount);
	let invoiceArray = [{ "3": { "value": rid }, "42": { "value": subtotal }, "39": { "value": "Created" }, "62": { "value": Number(newInvoice.dailyActionsAmount) }, "141": { "value": Number(newInvoice.testsAmount) } , "110": { "value": Number(newInvoice.panelsAmount) }, "61": { "value": Number(newInvoice.covidAmount) } }]
	let finalRes = await post_patch_records(realmName, "bu5h2c6bg", appToken, invoiceArray)
	 window.location.replace(
            `https://axisrisk.quickbase.com/db/bu5h2c6bg?a=dr&rid=${rid}`)
        return alert('You have succesfully Submitted')


}
	
	
}

const goodToGo = async() => {
let count = 0
if(newInvoice.testsArray.length>0){
	newInvoice.testsArray.forEach(el => {
			if(el["34"]){
				
			}else{
				count++
			}
			})

	if(count>0){
		return false
	}else{
		return true
	}
}else{
	return true
}



}


let turnNumIntoCommaSepAndDecimal =(num)=> {

	let parseNum = parseFloat(num).toFixed(2)
	let parseNumArray = parseNum.toString().split(".")
	let stringNum = Number(parseNumArray[0]).toLocaleString("en-US")+"."+parseNumArray[1]
	return stringNum


}


const getStates = (arr) => {
    const states = []
    arr.forEach((obj) => {
        if (!states.includes(obj["16"].value)) {
        states.push(obj["16"].value)
        }
    })
    return states
    }
    

const getPatients= (arr) => {
    const patients = []
    arr.forEach((obj) => {
        if (!patients.includes(obj["22"].value)) {
        patients.push(obj["22"].value)
        }
    })
    return patients
    }

const findTheDailyActionsArray = (node) => {
  event.preventDefault();
  let searchStringOne = document.getElementById("state-search").value;
  let searchStringTwo = document.getElementById("job-search").value;
  let startDateValue = document.getElementById("start-date").value;
  let endDateValue = document.getElementById("end-date").value;
  let searchStringThree = document.getElementById("patient-dropdown").value;
  let filteredArray = [];

  if (startDateValue !== "" && endDateValue === "") {
    filteredArray = newInvoice.dailyActionsArray.filter((element) => {
      let tempDate = new Date(element["8"].value).getTime();
      let startDate = new Date(startDateValue).getTime();
      if (tempDate >= startDate) {
        return element;
      }
    });
  } else if (startDateValue !== "" && endDateValue !== "") {
    filteredArray = newInvoice.dailyActionsArray.filter((element) => {
      let tempDate = new Date(element["8"].value).getTime();
      let startDate = new Date(startDateValue).getTime();
      let endDate = new Date(endDateValue).getTime();
      if (tempDate >= startDate && tempDate <= endDate) {
        return element;
      }
    });
  } else if (startDateValue === "" && endDateValue !== "") {
    filteredArray = newInvoice.dailyActionsArray.filter((element) => {
      let tempDate = new Date(element["8"].value).getTime();
      let endDate = new Date(endDateValue).getTime();

      if (tempDate <= endDate) {
        return element;
      }
    });
  } else {
  }
  if (searchStringOne.length > 0 && searchStringTwo.length === 0) {
    filteredArray = newInvoice.dailyActionsArray.filter((element) =>
      element["16"].value.toLowerCase().includes(searchStringOne.toLowerCase())
    );
  } else if (searchStringTwo.length > 0 && searchStringOne.length === 0) {
    filteredArray = newInvoice.dailyActionsArray.filter((element) =>
      element["14"].value.toLowerCase().includes(searchStringTwo.toLowerCase())
    );
  } else if (searchStringTwo.length > 0 && searchStringOne.length > 0) {
    filteredArray = newInvoice.dailyActionsArray.filter((element) =>
      element["16"].value.toLowerCase().includes(searchStringOne.toLowerCase())
    );
    filteredArray = filteredArray.filter((element) =>
      element["14"].value.toLowerCase().includes(searchStringTwo.toLowerCase())
    );
  } else {
  }

  if (searchStringThree.length > 0 && filteredArray.length > 0) {
    filteredArray = filteredArray.filter((element) =>
      element["22"].value
        .toLowerCase()
        .includes(searchStringThree.toLowerCase())
    );
  } else if (searchStringThree.length > 0 && filteredArray.length === 0) {
    filteredArray = newInvoice.dailyActionsArray.filter((element) =>
      element["22"].value
        .toLowerCase()
        .includes(searchStringThree.toLowerCase())
    );
  } else {
  }
  if (filteredArray.length === 0) {
    filteredArray = newInvoice.dailyActionsArray;
    populateDailyActions(filteredArray, node);
  }

  let expendableLines = document.querySelectorAll(".dailyActionLines");
  expendableLines.forEach((ele) => {
    ele.remove();
  });
  let modalString = `<div class="mm-div-container mm-header-container grid grid-cols-7 dailyActionLines">
                        <p class="px-2.5 text-center">Date</p>
                        <p class="px-2.5 text-center">Patient</p>
                        <p class="px-2.5 text-center">Job Name</p>
                        <p class="px-2.5 text-center">State</p>
                        <p class="px-2.5 text-center">Outcome</p>
                        <p class="px-2.5 text-center">Time Spent(Min)</p>
                        <p class="px-2.5 text-center">Remove</p>
                        </div>`;

  filteredArray.forEach((line) => {
    modalString += `<div class="mm-div-container grid grid-cols-7 dailyActionLines" id=${
      line["3"].value
    }>
				<p class="px-2.5 text-center">${line["8"].value}</p>
				<p class="px-2.5 text-center">${line["22"].value}</p>
				<p class="px-2.5 text-center">${line["14"].value}</p>
				<p class="px-2.5 text-center">${line["16"].value}</p>
				<p class="px-2.5 text-center">${line["44"].value}</p>
				<p class="px-2.5 text-center">${parseFloat(line["48"].value).toFixed(2)}</p>
				<button class="trash-button px-2.5 text-center" onClick="getTrashed(this, 'daily action')">&#128465;&#65039;</button>
				</div>`;
  });
  let innerContentNode = document.getElementById("dailyActionInnerContent");
  innerContentNode.innerHTML += modalString;
};
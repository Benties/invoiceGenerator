const populateCovid = async (invoice, covidNode) => {
    let modalString = `<div class="mm-header-container grid grid-cols-6">
                          <p class="px-2.5 text-center">Date</p >
                          <p class="px-2.5 text-center">Patient</p>
                          <p class="px-2.5 text-center">Job Number</p>
                          <p class="px-2.5 text-center">Job Name</p>
                          <p class="px-2.5 text-center">Time Spent(Min)</p>
                          <p class="px-2.5 text-center">Remove</p>
                          </div >`;

    invoice.covidArray.forEach((line) => {
      modalString += `<div class="grid grid-cols-6" id=${line["3"].value}>
                  <p class="px-2.5 text-center">${line["8"].value}</p>
                  <p class="px-2.5 text-center">${line["14"].value}</p>
                  <p class="px-2.5 text-center">${line["16"].value}</p>
                  <p class="px-2.5 text-center">${line["17"].value}</p>
                  <p class="px-2.5 text-center">${line["20"].value}</p>
                  <button class="trash-button px-2.5 text-center" onClick="getTrashed(this, 'covid')">&#128465;&#65039;</button>
                  </div>`;
    });

    covidNode.innerHTML = `<div class="mm-left-div-bottom overflow-y-auto max-h-96">${modalString}</div>`;
  };

  const getCovidData = async (parentId, clientId, Invoice) => {
    console.log(parentId)
    console.log(clientId)
    console.log(`**********************\n\n\n ${Object.values(Invoice)}\n\n\n**********************`)
    let totalHours = 0;
    let hostName = "axisrisk.quickbase.com";
    let tableId = "bu5h2c5nk";
    let appToken = "d9gqmuadcin9hwg3nwqib4gqkpm";
    let fidArr = [3, 23, 16, 17, 14, 8, 20, 24, 25];
    let queryParam = `{'23'.EX.${clientId}}AND{'8'.OAF.'6/15/23'}AND{'25'.EX.'false'}`;

    let covidData = await get_records(
      hostName,
      tableId,
      appToken,
      fidArr,
      queryParam,
      [{ fieldId: 14, order: "ASC" }]
    );

    console.log(covidData)

    covidData.data.forEach((el) => {
      totalHours += el["20"].value;
    });

    let floatTotalHours = parseFloat(totalHours).toFixed(2);
    Invoice.covidHours = floatTotalHours;
    Invoice.covidArray = covidData.data;
    return [floatTotalHours, covidData.data];
  };

  let getCovidTotal = async (Invoice, Contract) => {
    let covidTot = 0;
    let totHours = Number(Invoice.covidHours);
    let covidAdditionalCost = 0;
    switch (Contract.covidContractType) {
      case "Straight T&M":
        covidTot = parseFloat(totHours * Contract.covidtmRate).toFixed(2);
        break;
      case "Do Not Exceed":
        if (
          Contract.covidAnnualHours -
            (Contract.covidHoursUsed + Number(totHours)) >=
          0
        ) {
          covidTot = parseFloat(totHours * Contract.covidtmRate).toFixed(2);
        } else if (Contract.covidAnnualHours - Contract.covidHoursUsed >= 0) {
          let regCostHours = Contract.covidAnnualHours - Contract.covidHoursUsed;
          let overCost = Number(totHours) - regCostHours;

          covidTot = parseFloat(
            regCostHours * Contract.covidtmRate +
              overCost * Contract.covidOverageRate
          ).toFixed(2);
        } else {
          covidTot = parseFloat(totHours * Contract.covidOverageRate).toFixed(2);
        }
        break;
      case "Fixed Fee":
        if (Contract.billingFrequency === "Monthly") {
          covidTot = parseFloat(Contract.covidAnnualFlatRate / 12).toFixed(2);
        } else if (Contract.billingFrequency === "Quarterly") {
          covidTot = parseFloat(Contract.covidAnnualFlatRate / 4).toFixed(2);
        } else {
          covidTot = Contract.covidAnnualFlatRate;
        }
        break;
      case "Fixed Fee Plus":
        if (Contract.billingFrequency === "Monthly") {
          dailyActTot = parseFloat(Contract.covidAnnualFlatRate / 12).toFixed(2);
        } else if (Contract.billingFrequency === "Quarterly") {
          dailyActTot = parseFloat(Contract.covidAnnualFlatRate / 4).toFixed(2);
        } else {
          dailyActTot = Contract.covidAnnualFlatRate;
        }
        covidAdditionalCost = parseFloat(totHours * Contract.covidtmRate).toFixed(
          2
        );
        covidTot = Number(covidTot) + Number(covidAdditionalCost);
        break;
      case "DNE Fixed Fee":
        if (
          Contract.billingFrequency == "Monthly" &&
          Contract.covidAnnualHours -
            (Contract.covidHoursUsed + Number(totHours)) >=
            0
        ) {
          covidTot = parseFloat(Contract.covidAnnualFlatRate / 12).toFixed(2);
        } else if (
          Contract.billingFrequency === "Monthly" &&
          Contract.covidAnnualHours -
            (Contract.covidHoursUsed + Number(totHours)) <
            0
        ) {
          let overage = 0;
          if (Contract.covidHoursUsed > Contract.covidAnnualHours) {
            overage = parseFloat(
              Contract.covidOverageRate * Number(totHours)
            ).toFixed(2);
          } else {
            overage = parseFloat(
              Contract.covidOverageRate *
                (Contract.covidHoursUsed +
                  Number(totHours) -
                  Contract.covidAnnualHours)
            ).toFixed(2);
          }
          covidTot = parseFloat(
            Contract.covidAnnualFlatRate / 12 + overage
          ).toFixed(2);
        } else if (
          Contract.billingFrequency === "Quarterly" &&
          Contract.covidAnnualHours -
            (Contract.covidHoursUsed + Number(totHours)) >=
            0
        ) {
          covidTot = parseFloat(Contract.covidAnnualFlatRate / 4).toFixed(2);
        } else if (
          Contract.billingFrequency === "Quarterly" &&
          Contract.covidAnnualHours -
            (Contract.covidHoursUsed + Number(totHours)) <
            0
        ) {
          let overage = 0;
          if (Contract.covidHoursUsed > Contract.covidAnnualHours) {
            overage = parseFloat(
              Contract.covidOverageRate * Number(totHours)
            ).toFixed(2);
          } else {
            overage = parseFloat(
              Contract.covidOverageRate *
                (Contract.covidHoursUsed +
                  Number(totHours) -
                  Contract.covidAnnualHours)
            ).toFixed(2);
          }
          covidTot = parseFloat(
            Contract.covidAnnualFlatRate / 4 + overage
          ).toFixed(2);
        } else if (Contract.billingFrequency === "Biannually") {
          covidTot = doTheBiannualThing(dataArray, totHours);
        } else if (
          Contract.covidAnnualHours -
            (Contract.covidHoursUsed + Number(totHours)) <
          0
        ) {
          let overage = 0;
          if (Contract.covidHoursUsed > Contract.covidAnnualHours) {
            overage = parseFloat(
              Contract.covidOverageRate * Number(totHours)
            ).toFixed(2);
          } else {
            overage = parseFloat(
              Contract.covidOverageRate *
                (Contract.covidHoursUsed +
                  Number(totHours) -
                  Contract.covidAnnualHours)
            ).toFixed(2);
          }
          covidTot = parseFloat(overage).toFixed(2);
        } else {
          covidTot = Contract.covidAnnualFlatRate;
        }
        break;
    }
    Invoice.covidAmount = covidTot;
    return covidTot;
  };

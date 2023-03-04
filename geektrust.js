const fs = require("fs")

const filename = process.argv[2];
const passengers = [];

const centralStation = [];
const airportStation = [];

function addPassenger(inputLine) {
    const metrocardId = inputLine.split(" ")[1];
    const passengerBalance = Number(inputLine.split(" ")[2]);
    passengers.push({
        id: metrocardId,
        balance: passengerBalance,
        lastStop: null
    });
}

function addStationTransaction(inputLine) {
    const id = inputLine.split(" ")[1];
    const type = inputLine.split(" ")[2];
    const station = inputLine.split(" ")[3];

    const [passenger] = passengers.filter((p) => p.id == id);

    let discountPercent = 0;
    let discountAmount = 0;
    const serviceTax = 2;
    let travelAmount;
    if (passenger.lastStop != null) {
        discountPercent = 50;
        passenger.lastStop = null;
    } else {
        passenger.lastStop = station;
    }

    if(type == "ADULT") {
        travelAmount = 200;
    } else if(type == "SENIOR_CITIZEN") {
        travelAmount = 100;
    } else if(type == "KID") {
        travelAmount = 50;
    }

    if(discountPercent) {
        discountAmount = travelAmount * discountPercent / 100;
        travelAmount = travelAmount - travelAmount * discountPercent / 100
    }

    if(passenger.balance < travelAmount) {
        let remainingBalance;
        if(passenger.balance >= 0) {
            remainingBalance = travelAmount - passenger.balance;
        } else {
            passenger.balance = 0;
            remainingBalance = travelAmount;
        }
        const finalAmount = (passenger.balance + remainingBalance + Math.floor(remainingBalance * serviceTax / 100));

        if(station == "CENTRAL") {
            centralStation.push({
                amount: finalAmount,
                type: type,
                discount: discountAmount,
            });
        } else {
            airportStation.push({
                amount: finalAmount,
                type: type,
                discount: discountAmount,
            });
        }

        passenger.balance -= finalAmount;
    } else {
        if(station == "CENTRAL") {
            centralStation.push({
                amount: travelAmount,
                type: type,
                discount: discountAmount,
            });
        } else {
            airportStation.push({
                amount: travelAmount,
                type: type,
                discount: discountAmount,
            });
        }
        passenger.balance -= travelAmount;
    }
}

function calcTotalDiscount(stationArray) {
    let total = 0;
    for(const transaction of stationArray) {
        total += transaction.discount;
    }
    return total;
}

function calcTotalAmount(stationArray) {
    let total = 0;
    for(const transaction of stationArray) {
        total += transaction.amount;
    }
    return total;
}

function calcPassengerTypes(stationArray) {
    let passengerTypes = {};
    for(const transaction of stationArray) {
        const type = transaction.type;
        if(passengerTypes[type]) {
            passengerTypes[type] += 1; 
        } else {
            passengerTypes[type] = 1;
        }
    }
    const passengerTypesArray = [];
    for(let key of Object.keys(passengerTypes)) {
        passengerTypesArray.push({
            type: key,
            count: passengerTypes[key],
        })
    }

    passengerTypesArray.sort((a, b) => {
        if(a.count === b.count) {
            return (a.type).localeCompare(b.type);
        }

        return b.count - a.count;
    })
    return passengerTypesArray;
}

function printSummary() {
    const centralStationSummary = {
        name: "CENTRAl",
        amount: calcTotalAmount(centralStation),
        discount: calcTotalDiscount(centralStation)
    }
    const airportStationSummary = {
        name: "AIRPORT",
        amount: calcTotalAmount(airportStation),
        discount: calcTotalDiscount(airportStation)
    }

    console.log("TOTAL_COLLECTION", centralStationSummary.name, centralStationSummary.amount,centralStationSummary.discount);
    console.log("PASSENGER_TYPE_SUMMARY");
    for(const passengerTypeObject of calcPassengerTypes(centralStation)) {
        console.log(passengerTypeObject.type, passengerTypeObject.count);
    }
    
    console.log("TOTAL_COLLECTION", airportStationSummary.name, airportStationSummary.amount,airportStationSummary.discount);
    console.log("PASSENGER_TYPE_SUMMARY");
    for(const passengerTypeObject of calcPassengerTypes(airportStation)) {
        console.log(passengerTypeObject.type, passengerTypeObject.count);
    }

}

function execute(inputLine) {
    const command = inputLine.split(" ")[0];
    if (command == "BALANCE") {
        addPassenger(inputLine);
    } else if (command == "CHECK_IN") {
        addStationTransaction(inputLine);
    } else {
        printSummary();
    }
}

fs.readFile(filename, "utf8", (err, data) => {
    if (err) throw err
    var inputLines = data.toString().split("\n")
    // Add your code here to process input commands
    for (let command of inputLines) {
        execute(command);
    }
})


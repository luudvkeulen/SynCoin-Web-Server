const Web3 = require("web3");

const web3 = new Web3("ws://localhost:8546");

console.log("Obtaining balance of coinbase...");

web3.eth.getCoinbase().then(function(coinbase) {
    console.log("Coinbase: " + coinbase);
    web3.eth.getBalance(coinbase).then(function (balance) {
        console.log("Balance: " + balance);

        obtainContractEvents();
    }).catch(console.error);
}).catch(console.error);


function obtainContractEvents() {
    console.log("Obtaining contract events...");
    var beerContract = new web3.eth.Contract([
        {
            "constant": true,
            "inputs": [],
            "name": "active",
            "outputs": [{"name": "", "type": "bool", "value": true}],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [{"name": "_reference", "type": "string"}],
            "name": "cancel",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "beerPrice",
            "outputs": [{"name": "", "type": "uint256", "value": "1000"}],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [],
            "name": "toggleActive",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "orderLifetime",
            "outputs": [{"name": "", "type": "uint256", "value": "604800"}],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [],
            "name": "drain",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [{"name": "_reference", "type": "string"}],
            "name": "confirm",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [{"name": "_reference", "type": "string"}],
            "name": "order",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "name": "_beerPrice",
                    "type": "uint256",
                    "index": 0,
                    "typeShort": "uint",
                    "bits": "256",
                    "displayName": "&thinsp;<span class=\"punctuation\">_</span>&thinsp;beer Price",
                    "template": "elements_input_uint",
                    "value": "1000"
                },
                {
                    "name": "_orderLifetime",
                    "type": "uint256",
                    "index": 1,
                    "typeShort": "uint",
                    "bits": "256",
                    "displayName": "&thinsp;<span class=\"punctuation\">_</span>&thinsp;order Lifetime",
                    "template": "elements_input_uint",
                    "value": "604800"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {"indexed": false, "name": "_reference", "type": "string"},
                {"indexed": false, "name": "amount", "type": "uint256"}
            ],
            "name": "OrderCreated",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [{"indexed": false, "name": "_reference", "type": "string"}],
            "name": "OrderConfirmed",
            "type": "event"
        }
    ], "0x345b63fcAA8fe182ad94564985edc0235EEC0ac4");

    beerContract.events.allEvents({"fromBlock": 1}, function (error, result) {
        if (!error) {
            console.log(result.event + ": " + result.returnValues._reference);
        } else {
            console.log(error);
        }
    });
}

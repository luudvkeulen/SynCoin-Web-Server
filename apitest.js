const SynCoinApi = require("./services/SynCoinService");

var api = new SynCoinApi("ws://localhost:8546", "0x345b63fcAA8fe182ad94564985edc0235EEC0ac4");

api.createWallet("asdf");

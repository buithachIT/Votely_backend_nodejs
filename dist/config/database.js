"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const dbState = [
    {
        value: 0,
        label: "Disconnected",
    },
    {
        value: 1,
        label: "Connected",
    },
    {
        value: 2,
        label: "Connecting",
    },
    {
        value: 3,
        label: "Disconnecting",
    },
];
const connection = async () => {
    await mongoose_1.default.connect(process.env.MONGO_DB_URL);
    const state = Number(mongoose_1.default.connection.readyState);
    console.log(dbState.find((f) => f.value === state)?.label, "to database"); // connected to db
};
exports.default = connection;

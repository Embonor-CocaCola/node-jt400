"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const chai_1 = require("chai");
describe('MessageQ', function () {
    return __awaiter(this, void 0, void 0, function* () {
        it('should open a message queue and write/read a message.', () => __awaiter(this, void 0, void 0, function* () {
            const msgq = yield db_1.jt400.openMessageQ({
                name: process.env.AS400_USERNAME || ''
            });
            const testMessage = 'Test Message';
            yield msgq.sendInformational(testMessage);
            chai_1.expect(yield msgq.read()).to.equal(testMessage);
        })).timeout(5000);
    });
});
//# sourceMappingURL=msgq-spec.js.map
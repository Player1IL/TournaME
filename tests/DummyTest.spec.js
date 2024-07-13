import {expect} from "chai";

describe("Array", () => {
    describe("#sort", () => {
        it("Should sort the array by name", () => {
            const names = ["Daniel", "Adam", "Sam"];
            expect(names.sort()).to.be.eql(["Adam", "Daniel", "Sam"]);
        });
    });
});

describe("When library is loaded ", function(){
    it("GippiEs class is available", function(){
        expect(GippiEs).toBeDefined();
        expect(typeof GippiEs).toBe("function");
    });

    if("GippiEs is a singleton", function(){
        expect(true).toBe(true);
    });
});

describe("Second tests here", function(){
    it("fails always", function(){
        expect(true).toBeFalsy();
    });
});

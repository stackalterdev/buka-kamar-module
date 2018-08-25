function test(name, path) {
    describe(name, function () {
        require(path);
    });
}


describe('#dl-module', function (done) {
    this.timeout(2 * 60000);

});

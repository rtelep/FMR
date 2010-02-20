/**
 * @fileoverview
 * Test FMR
 */

/**
 *  QUnit
 *  ok(state, message)
 *  equals(actual, expected, message)
 *  same(actual, expected, message)
 *  expect(amount) // number of assertions expected to run in a test.
 */

function run_tests () {

    module('Flah');

    test('Everything seems ok so far', function(){
        expect(1);
        stop();
        $.getJSON('/fmr/_design/couchapp_fmr/fmrJS/testsuite/test.json',function(data){
            start();
            t = new Thread(data);
            console.log(t);
            ok(t, 'we have a Thread object');
            
        })
    });
}


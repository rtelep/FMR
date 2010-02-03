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
        $.getJSON('/fmr/_design/couchapp_fmr/_view/by_path?key="006e34bb9218f22d92db682f06f2852d"',function(data){
            start();
            t = new Thread(data.rows);
            console.log(t);
            ok(t, 'we have a Thread object');
            
            t.render();
        })
    });
}


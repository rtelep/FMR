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
        $.getJSON('/fmr/_design/couchapp_fmr/_view/by_path?key=["898feea90e55a22d66954a95c153f6da"]',function(data){
            start();
            t = new Thread(data.rows);
            console.log(t);
            ok(t, 'we have a Thread object');
        })
    });
}

sitemap_data = [
        {'path_info': '/'}
    ,   {'path_info': '/i/am/an/orphan/i/get/stuck/on/root'}
    ,   {'path_info': '/a/'}
    ,   {'path_info': '/a/a.png'}
    ,   {'path_info': '/b/'}
    ,   {'path_info': '/b/bb/'}
    ,   {'path_info': '/b/bb/bbb.png'}
    ,   {'path_info': '/b/bb/bbb.jpg'}
    ,   {'path_info': '/b/bb/bbb.gif'}
    ,   {'path_info': '/c/'}
    ,   {'path_info': '/c/cc/'}
    ,   {'path_info': '/c/cc/ccc/'}
    ,   {'path_info': '/c/cc/ccc/cccc/'}
    ,   {'path_info': '/c/cc/ccc/cccc/cccc.png'}
]

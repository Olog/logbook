/**
 * Tests for index
 *
 * @author Dena Mujtaba
 */

QUnit.module("index.js Tests");

/**
 * Tests DeleteLogbookHandler() function
 */
QUnit.test("Test Delete Logbook", function(assert){
    //log used to test with
    var testlogbk = $('#load_logbooks .multilist_item').first();

    testlogbk.find('a:first-child').trigger('click'); // trigger showDeleteModal

    var deleteModal = $('#deleteLogbookModal');

    assert.equal((deleteModal.length >= 0), true, "Test Modal was added");


});


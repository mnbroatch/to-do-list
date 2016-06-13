"use strict";

var isAnimated = false;

//  populate array of list objects
try {
	var toDoArray = JSON.parse(localStorage.todo);
} catch (e) {
	var toDoArray = [];
}

//  reattach prototype we lost when storing to localStorage :(
//
//  THIS DOESN'T WORK
// for (task in toDoArray){
// 	toDoArray[task].prototype = Task.prototype;
// }


// (is there a faster way?)
for (let task in toDoArray){
	Object.defineProperty(toDoArray[task], 'ind', { get: taskIndexGetter });
	Object.defineProperty(toDoArray[task], '$element', { get: taskElementGetter }); 
}

$(document).ready( function(){

	if (toDoArray[0])
		initializeTable();

	$('#addButton').on('click', function(){
		let taskToAdd = new Task( $('#newDescription').val(), $('#newDueDate').val() );
		addToList(taskToAdd);
		addToDOM( taskToAdd.$element ); //  element must be added to list first. 
		$("#newDescription").val("");
		$("#newDueDate").val("");
		writeListToStorage();
	});

	$('#toDoListTable').on('change', '.done-checkbox', function(){
		let index = $(this).closest('tr').data('index');
		toDoArray[index].done = !toDoArray[index].done 
		writeListToStorage();
	}
	);

	$('#toDoListTable').on('click','.delete-button button', function(e) {
		$('#toDoListTable').off();
		removeTask(e.target);
	});

	$('#deleteDoneButton').on('click', function(e){
		$('#toDoListTable').off();
		$('input:checked').each( function(ind,el){
			removeTask(el);
		});
		writeListToStorage();
	});

});






function Task(description,dueDate){
	this.description = description;
	this.dueDate = dueDate;
	this.done = false;
}

Object.defineProperty(Task.prototype, '$element', { get: taskElementGetter });
Object.defineProperty(Task.prototype, 'ind', { get: taskIndexGetter });

function taskIndexGetter() { 
	return toDoArray.indexOf(this);
}

function taskElementGetter() { 
	let $rowToAdd = $('#entryTemplate').clone();
	$rowToAdd.removeAttr('id');
	$rowToAdd.find('.description').text(this.description);
	$rowToAdd.find('.due-date').text(this.dueDate);
	$rowToAdd.find('.done-checkbox').attr('checked',this.done);
	$rowToAdd.data('index', this.ind);
	return $rowToAdd;
}

function removeTask(deleteButton){
	removeFromList($(deleteButton).closest('tr'));	
	removeFromDOM($(deleteButton).closest('tr'));	
	writeListToStorage();
}

function removeFromList($task) {
	let elIndex = $task.data('index');
	toDoArray.splice( elIndex, 1);
}

function removeFromDOM($task) {

	//  fix data(index)s after removing from toDoArray
	var taskInd = $task.index();
	for (let i = taskInd, len = $('#toDoListTable>tbody>tr').length; i < len; i++){
		var ind = $( $('#toDoListTable>tbody>tr')[i]).data('index');
		ind--;
		$( $('#toDoListTable>tbody>tr')[i] ).data('index',ind);
	}

	$task
	.children('td')
	.animate({ padding: 0 })
	.wrapInner('<div />')
	.children()
	.slideUp( function(){ 
		var row = $(this).closest('tr');
		row.remove();




//  reattach event handlers, check if they exist so multi-delete works OK
		if( !$._data(document.getElementById('toDoListTable'), "events")){ 
			console.log('asd');
			$('#toDoListTable').on('change', '.done-checkbox', function(){
				$('#toDoListTable').off();
				let index = $(this).closest('tr').data('index');
				toDoArray[index].done = !toDoArray[index].done 
				writeListToStorage();
			}
			);

			$('#toDoListTable').on('click','.delete-button button', function(e) {
				$('#toDoListTable').off();
				removeTask(e.target);
			});

		}








	});









	$('#toDoListTable>tbody>tr').each( function(ind, el) {
		if ( $(el).data('index') % 2) {
			$(el).css('background-color','#01b6ad');
		}
		else {
			$(el).css('background-color','#cdfffd');
		}
	});
}

function addToList(task) {
	toDoArray.push(task);
}

function addToDOM($task) {
	$('#toDoListTable').append($task);
}

function writeListToStorage(){
	localStorage.todo = JSON.stringify(toDoArray);
}

function initializeTable() {
	var $tasks = toDoArray.map( task => task.$element );
	$('#toDoListTable').append($tasks);
}



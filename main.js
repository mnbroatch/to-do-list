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
for (task in toDoArray){
	Object.defineProperty(toDoArray[task], '$element', { get: taskElementGetter }); 
}

$(document).ready( function(){

	if (toDoArray[0])
		initializeTable();

	$('#addButton').on('click', function(){
		let taskToAdd = new Task( $('#newDescription').val(), $('#newDueDate').val() );
		addToDOM( taskToAdd.$element ); //  element must be added to DOM first. How can I remove this dependency?
		addToList(taskToAdd);
		$("#newDescription").val("");
		$("#newDueDate").val("");
		writeListToStorage();
	});

	$('#toDoListTable').on('change', '.done-checkbox', function(){
		let index = $(this).closest('tr').data('index');
		toDoArray[index].done ^= 1;  // bitwise just for fun :D 
		writeListToStorage();
	});

	$('#toDoListTable').on('click','.delete-button', function(){
		removeFromList(this);	
		removeFromDOM($(this).closest('tr'));	
		writeListToStorage();
	});

});



function Task(description,dueDate){
	this.description = description;
	this.dueDate = dueDate;
	this.done = false;
	this.index = toDoArray.length;
}

Object.defineProperty(Task.prototype, '$element', { get: taskElementGetter });

function taskElementGetter() { 
	let $rowToAdd = $('#entryTemplate').clone();
	$rowToAdd.removeAttr('id');
	$rowToAdd.find('.description').text(this.description);
	$rowToAdd.find('.due-date').text(this.dueDate);
	$rowToAdd.find('.done-checkbox').attr('checked',this.done);
	$rowToAdd.data('index', this.index);
	return $rowToAdd;
}

function removeFromList(task) {
	toDoArray.splice( $(task).data('index'), 1);
}

function removeFromDOM(task) {
	$(task).remove();
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



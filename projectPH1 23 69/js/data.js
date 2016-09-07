var completedTasks = [];
var inProgressTasks = [];
var archivedTasks = [];
var dropdownList = '<li class="dropdown">'+
									'<a aria-expanded="false" class="dropdown-toggle" data-toggle="dropdown" href="#">'+
										'<span class="glyphicon glyphicon-menu-hamburger"></span></p>'+
									'</a>'+
									'<ul class="dropdown-menu">'+
										'<li><a href="#dropdown1" data-toggle="tab" class="edit-task" onclick="editTask(this)">Edit Task</a></li>'+
										'<li class="divider"></li>';
							
var archiveAdd = 	'<li><a href="#dropdown2" data-toggle="tab" class="archive-task" onclick="archiveTask(this)">Move to Archived Tasks</a></li>';

var completedAdd =  '<li><a href="#dropdown2" data-toggle="tab" class="task-completed" onclick="addToCompleted(this)">Move to Completed Tasks</a></li>';

var archiveRemove = '<li><a href="#dropdown2" data-toggle="tab" class="archive-task" onclick="unarchiveTask(this)">Remove from Archived Tasks</a></li>';

var completeRemove = '<li><a href="#dropdown2" data-toggle="tab" class="task-completed" onclick="undoCompleted(this)">Remove from Completed Tasks</a></li>';

var closeDropdownList = '<li class="divider"></li>'+
										'<li><a href="#dropdown2" data-toggle="tab" class="delete-task" onclick="deleteTask(this)">Delete</a></li>'+
										'</ul>'+
									'</li>';
									
var inProgressCheckbox = '<div class="checkbox checkbox-circle"><input name="Done" class="checkbox-done" type="checkbox" autocomplete="off" onchange="handleDone(this)"><label></label></div>';

var completedCheckbox = '<div class="checkbox checkbox-circle"><input name="Done" class="checkbox-done" type="checkbox" checked="true" autocomplete="off" onchange="handleDone(this)"><label></label></div>';

var deleteCheckbox = '<div class="checkbox checkbox"><input name="actionOnMark" class="checkbox-done" type="checkbox" autocomplete="off"><label></label></div>';

var alertDescription =  '<div style="float: right;">' + '<a href="#" onclick="printDescription(this)">'+'<span class="glyphicon glyphicon-comment">'+'</span>'+'</a>' + '</div>';

var star = '<span class="glyphicon glyphicon-star" style="color: black;"></span>';

var selectAllCheckbox = '<div> Select all <input name="select-all" class="checkbox-done"' + 
											'type="checkbox" autocomplete="off" onchange="selectAll(this)"><label></label></div>';

var currentPanel = 0;
var editing = false;
var editIndex = 0;
var editArr = 0;
var editSource = 0;
var temp1;
var temp2;
var chooseMark = 0;
var archivedText = "Archived";
var firstLoad = true;
function getArrays() {
	$.ajax ({
		url: '/arraydata',
		type: 'post',
		success: function(data) {
			console.log(data);
			if(data != null) {
				inProgressTasks = data['inProgressArray[]'];
				completedTasks = data['completedArray[]'];
				archivedTasks = data['archivedArray[]'];
				if(inProgressTasks == null || completedTasks == null || archivedTasks == null) {
					inProgressTasks = [];
					completedTasks = [];
					archivedTasks = [];
				}
				if(firstLoad) {
					firstLoad = false;
					var split = data["name"].split(' ');
					console.log(split);
					var firstName = split[0];
					document.getElementById("first-name").innerHTML = firstName;
					printCurrentPanel();
				}
			}
		}
	});
}
$(document).ready(function() {
	$("#table").DataTable({
			"columnDefs": [
				{"orderable":false, "targets": 0},
				{"orderable":false, "targets": 3}
			]
	});
	$('#date-time-picker').datepicker();
	getArrays();
});

function validate() {
	if(document.getElementById('inputTask').value=="") {
		var alertTask = document.getElementById("alertd");
		$(document).ready(function(){
			$("#alertMessage").html("You didn't enter a task name!");
		});
		alertTask.style.display = "block";
		return false;
	}
	else {
		return true;
	}
}  					

function addTask() {
	var date = $('#date-time-picker').val();
	var taskName = $('#inputTask').val(); 
	var description = $('#inputDescription').val();
	var prioritized = document.getElementById("prioritize").checked;
	var modal = document.getElementById('add-task-modal');
	var alertTask = document.getElementById("alertd");
	if(validate()) {
		if(!editing) {
			inProgressTasks.push([taskName, description, date, prioritized, 0]);//index 4 is the current state		
		}
		else {
			if(editArr == 0) {
				inProgressTasks[editIndex] = [taskName, description, date, prioritized, editSource];
			}
			else if(editArr == 1) {
				completedTasks[editIndex] = [taskName, description, date, prioritized, editSource];
			}
			else if(editArr == 2) {
				archivedTasks[editIndex] = [taskName, description, date, prioritized, editSource];
			}
		}

		printCurrentPanel();
		alertTask.style.display = "none";
		modal.style.display = "none";  
		editing = false;

	}
}

function printAllTasks() {
	resetTable();
	var taskTable = $("#table");
	var dTable = taskTable.DataTable();
	
	for (var i = 0 ; i < inProgressTasks.length; i++) {
		var taskName = 	'<div>' + inProgressTasks[i][0] + alertDescription + '</div>';
		var prioritized =  '<div>' + star + inProgressTasks[i][0] + alertDescription + '</div>';
		if(inProgressTasks[i][3]) {
			taskName = prioritized;
		}
		dTable.row.add([
					inProgressCheckbox,
					taskName,
					inProgressTasks[i][2],
					dropdownList + completedAdd + archiveAdd + closeDropdownList
					]);
	}
	for (var i = 0 ; i < completedTasks.length; i++) {
		var taskName = 	'<div>' + '<s>' + completedTasks[i][0] + '<\s>' + alertDescription + '</div>';
		var prioritized =  '<div>' + star + '<s>' + completedTasks[i][0] + '<\s>' + alertDescription + '</div>';
		if(completedTasks[i][3]) {
			taskName = prioritized;
		}
		dTable.row.add([
						completedCheckbox,	
						taskName,
						completedTasks[i][2],
						dropdownList + completeRemove + archiveAdd + closeDropdownList
						]);
	};
	dTable.draw();
}

function printInProgressTasks() {
	resetTable();
	var taskTable = $("#table");
	var dTable = taskTable.DataTable();
	for (var i = 0 ; i < inProgressTasks.length; i++) {
		var taskName = 	'<div>' + inProgressTasks[i][0] + alertDescription + '</div>';
		var prioritized =  '<div>' + star + inProgressTasks[i][0] + alertDescription + '</div>';
		if(inProgressTasks[i][3]) {
			taskName = prioritized;
		}
		dTable.row.add([
						inProgressCheckbox,
						taskName,
						inProgressTasks[i][2],
						dropdownList + completedAdd + archiveAdd + closeDropdownList
						]);		
	};
	dTable.draw();
}

function printCompletedTasks() {
	resetTable();
	var taskTable = $("#table");
	var dTable = taskTable.DataTable();
	for (var i = 0 ; i < completedTasks.length; i++) {
		var taskName = 	'<div>' + '<s>' + completedTasks[i][0] + '<\s>' + alertDescription + '</div>';
		var prioritized =  '<div>' + star + '<s>' + completedTasks[i][0] + '<\s>' + alertDescription + '</div>';
		if(completedTasks[i][3]) {
			taskName = prioritized;
		}
		dTable.row.add([
						completedCheckbox,
						taskName,
						completedTasks[i][2],
						dropdownList + completeRemove + archiveAdd + closeDropdownList
						]);
		
	};
	dTable.draw();
}

function printArchivedTasks() {
	resetTable();
	var taskTable = $("#table");
	var dTable = taskTable.DataTable();
	for (var i = 0 ; i < archivedTasks.length; i++) {
		var taskName = 	'<div>' + archivedTasks[i][0]  + alertDescription + '</div>';
		var prioritized =  '<div>' + star + archivedTasks[i][0] + alertDescription + '</div>';
		if(archivedTasks[i][3]) {
			taskName = prioritized;
		}
		dTable.row.add([
						archivedText,
						taskName,
						archivedTasks[i][2],
						dropdownList + archiveRemove + closeDropdownList
						]);
		
	};
	dTable.draw();
}

function resetTable() {
	$("#table").DataTable().clear();
}

function deleteTask(elmnt) {
	var taskTable = $("#table");
	var thisRow = $(elmnt).parents('tr');
	var dTable = taskTable.DataTable();
	var ind = dTable.row( thisRow ).index();
	dTable.row( thisRow ).remove().draw();
	switch(currentPanel){
	case 0:
		if(ind < inProgressTasks.length)
		{
			inProgressTasks.splice(ind, 1);
		}
		else
		{
			ind -= inProgressTasks.length;
			completedTasks.splice(ind, 1);
		}
		break;
	case 1:
		inProgressTasks.splice(ind, 1);
		break;
	case 2:
		completedTasks.splice(ind, 1);
		break;
	case 3:
		archivedTasks.splice(ind, 1);
		break;
	}
	refreshBadges();
}

function switchPanel(thisPanel, thisID) {
	document.getElementById("li-all-tasks").className = "";
	document.getElementById("li-in-progress").className = "";
	document.getElementById("li-completed").className = "";
	document.getElementById("li-archived").className = "";
	document.getElementById(thisID).className = "active";
	currentPanel = thisPanel;
	printCurrentPanel();
}

function printCurrentPanel() {
	refreshBadges();
	archiveButton = document.getElementById("archive-mark");
	archiveButton.onclick = function() {
		mark(1);
	};
	archiveButton.innerHTML = "<span class='glyphicon glyphicon-th-list'></span> Archive";
	document.getElementById("table").rows[0].cells[0].innerHTML = "Done";
	$("#table").DataTable().draw();
	switch(currentPanel){
	case 0: 
		printAllTasks();
		break;
	case 1:
		printInProgressTasks();
		break;
	case 2:
		printCompletedTasks();
		break;
	case 3:
		archiveButton.onclick = function() {
			mark(2);
		};
		archiveButton.innerHTML = "Unarchive";
		document.getElementById("table").rows[0].cells[0].innerHTML = "State";
		$("#table").DataTable().draw();
		printArchivedTasks();
		break;
	}
}

function refreshBadges() {
	var allTasksLen = inProgressTasks.length + completedTasks.length;
	$("#all-tasks").html( allTasksLen );
	$("#in-progress").html(inProgressTasks.length);
	$("#archived-tasks").html(archivedTasks.length);
	$("#completed-tasks").html(completedTasks.length);
	sendArrays();
}

function handleDone(done) {
	var thisCheckbox = done.checked;
	if(thisCheckbox) {
		addToCompleted(done);
	}
	else {
		undoCompleted(done);
	}
}

function addToCompleted(elmnt) {
	var taskTable = $("#table");
	var thisRow = $(elmnt).parents('tr');
	var dTable = taskTable.DataTable();
	var ind = dTable.row( thisRow ).index();
	inProgressTasks[ind][4] = 1;
	completedTasks.push(inProgressTasks[ind]);
	inProgressTasks.splice(ind, 1);
	printCurrentPanel();
}

function undoCompleted(elmnt) {
	var taskTable = $("#table");
	var thisRow = $(elmnt).parents('tr');
	var dTable = taskTable.DataTable();
	var ind = dTable.row( thisRow ).index();
	if(currentPanel == 0) {
		ind -= inProgressTasks.length;
	}
	completedTasks[ind][4] = 0;
	inProgressTasks.push(completedTasks[ind]);
	completedTasks.splice(ind, 1);
	printCurrentPanel();	
}
function archiveTask (elmnt) {
	var taskTable = $("#table");
	var thisRow = $(elmnt).parents('tr');
	var dTable = taskTable.DataTable();
	var ind = dTable.row( thisRow ).index();
	dTable.row( thisRow ).remove().draw();
	if(currentPanel == 0) {
		if(ind >= inProgressTasks.length){
			ind -= inProgressTasks.length;
			archivedTasks.push(completedTasks[ind]);
			completedTasks.splice(ind, 1);
		}
		else {
			archivedTasks.push(inProgressTasks[ind]);
			inProgressTasks.splice(ind, 1);
		}
	}
	else if(currentPanel == 1) {
		archivedTasks.push(inProgressTasks[ind]);
		inProgressTasks.splice(ind, 1);
	}
	else if(currentPanel == 2) {
		archivedTasks.push(completedTasks[ind]);
		completedTasks.splice(ind, 1);
	}
	refreshBadges();
}

function unarchiveTask (elmnt) {
	var taskTable = $("#table");
	var thisRow = $(elmnt).parents('tr');
	var dTable = taskTable.DataTable();
	var ind = dTable.row( thisRow ).index();
	dTable.row( thisRow ).remove().draw();
	var source = archivedTasks[ind][4];
	if(source == 0) {
		inProgressTasks.push(archivedTasks[ind]);
	}
	else if(source == 1) {
		completedTasks.push(archivedTasks[ind]);
	}
	archivedTasks.splice(ind, 1);
	refreshBadges();
}
function editTask (elmnt) {
	editing = true;
	var taskTable = $("#table");
	var thisRow = $(elmnt).parents('tr');
	var dTable = taskTable.DataTable();
	var ind = dTable.row( thisRow ).index();
	var currentData;
	if(currentPanel == 0) {
		if(ind >= inProgressTasks.length){
			ind -= inProgressTasks.length;
			currentData = completedTasks[ind];
			editArr = 1;
		}
		else {
			currentData = inProgressTasks[ind];
			editArr = 0;
		}
	}
	else if(currentPanel == 1) {
		currentData = inProgressTasks[ind];
		editArr = 0;
	}
	else if(currentPanel == 2) {
		currentData = completedTasks[ind];
		editArr = 1;
	}
	else if(currentPanel == 3) {
		currentData = archivedTasks[ind];
		editArr = 2;
	}
	editIndex = ind;
	$("#modalTitle").html("Edit Task");
	$("#inputTask").val(currentData[0]);
	$("#inputDescription").val(currentData[1]);
	$("#date-time-picker").val(currentData[2]);
	document.getElementById("prioritize").checked = currentData[3];
	editSource = currentData[4];
	modal.style.display = "block";
	document.getElementById('inputTask').focus();
	sendArrays();
}

function mark(thisMark) {
	chooseMark = thisMark;
	document.getElementById("add-task-button").style.display = "none";
	document.getElementById("delete-button").style.display = "none";
	document.getElementById("archive-mark").style.display = "none";
	document.getElementById("mark-save-changes").style.display = "inline-block";
	document.getElementById("cancel-delete-button").style.display = "inline-block";
	temp1 = inProgressCheckbox;
	temp2 = completedCheckbox;
	inProgressCheckbox = deleteCheckbox;
	completedCheckbox = deleteCheckbox;
	archivedText = deleteCheckbox;
	printCurrentPanel();
	document.getElementById("table").rows[0].cells[0].innerHTML = selectAllCheckbox;
	$("#table").DataTable().draw();
}
function printDescription (elmnt) {
	var taskTable = $("#table");
	var thisRow = $(elmnt).parents('tr');
	var dTable = taskTable.DataTable();
	var ind = dTable.row( thisRow ).index();
	var description;
	if(currentPanel == 0) {
		if(ind >= inProgressTasks.length){
			ind -= inProgressTasks.length;
			description = completedTasks[ind][1];
		}
		else {
			description = inProgressTasks[ind][1];
		}
	}
	else if(currentPanel == 1) {
			description = inProgressTasks[ind][1];
	}
	else if(currentPanel == 2) {
		description = completedTasks[ind][1];
	}
	else if(currentPanel == 3) {
		description = archivedTasks[ind][1];
	}
	var modal_description = document.getElementById("description-modal");

	document.getElementById("descriptionHTML").innerHTML = description;
	modal_description.style.display = "block";
	modal_description.focus();

	document.getElementById("close-modal-desc").onclick = function() {
		modal_description.style.display = "none";
	}
	document.getElementById("close-button-desc").onclick = function() {
		modal_description.style.display = "none";
	}
	window.onclick = function(event) {
		if(event.target == modal_description) 
	  		modal_description.style.display = "none";
	}
	modal_description.onkeydown = function(event) {
  		if(event.keyCode==13 || event.keyCode==27)
			modal_description.style.display = "none";
	  }

}

function deleteMarked() {
	var markedTasks = getMarked();
	for(var i = 0 ; i < markedTasks.length ; i++) {
		deleteTask(markedTasks[i]);
	}
	cancelMark();
}

function cancelMark() {
	document.getElementById("add-task-button").style.display = "inline-block";
	document.getElementById("delete-button").style.display = "inline-block";
	document.getElementById("mark-save-changes").style.display = "none";
	document.getElementById("cancel-delete-button").style.display = "none";
	document.getElementById("archive-mark").style.display = "inline-block";
	inProgressCheckbox = temp1;
	completedCheckbox = temp2;
	archivedText = "Archived";
	printCurrentPanel();
}

function handleMark() {
	if($("#table").DataTable().data().length == 0){
		cancelMark();
		return;
	}
	if(chooseMark == 0) {
		deleteMarked();
	}
	else if(chooseMark == 1) {
		archiveMarked();
	}
	else if(chooseMark == 2) {
		unarchiveMarked();
	}
}

function archiveMarked() {
	var markedTasks = getMarked();
	for(var i = 0 ; i < markedTasks.length ; i++) {
		archiveTask(markedTasks[i]);
	}
	cancelMark();
}

function getMarked() {
	var table = document.getElementById("table");
	var markedTasks = [];
	var len = table.rows.length;
	for(var i = 1 ; i < len ; i++) {
		var checkBox = table.rows[i].cells[0].children[0].children[0];
		if(checkBox.checked) {
			markedTasks.push(checkBox);
		}
	}
	return markedTasks;
}

function unarchiveMarked() {
	var markedTasks = getMarked();
	for(var i = 0 ; i < markedTasks.length ; i++) {
		unarchiveTask(markedTasks[i]);
	}
	cancelMark();	
}

function selectAll(elmnt) {
	var checkBoxes = document.getElementsByName("actionOnMark");
	for(var i = 0 ; i < checkBoxes.length ; i++) {
		checkBoxes[i].checked = elmnt.checked;
	}
	$("#table").DataTable().draw();
}
function sendArrays() {
	var arrays = {
		'inProgressArray[]': inProgressTasks,
		'completedArray[]': completedTasks,
		'archivedArray[]': archivedTasks
	}
	$.ajax({
		url: "/array",
		type: "POST",
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify(arrays)

	});
}
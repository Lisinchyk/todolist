'use strict';

let dataJsonObj = () => {    
    let dataJson = {};

    fetch('data.json')
    .then(function(data) {        
        return data.json();
    })
    .then(function(data) {
        dataJson.statuses = data.statuses;
        dataJson.priorities = data.priorities;
        
        checkPriorityValid(data.priorities);
        showTableOnLoad();
    });


    return dataJson;
}

const checkPriorityValid = (array) => {
    let optionsArr = array;

    let result;

    todoData.forEach(obj => {
        result = optionsArr.indexOf(obj.priority);
        
        if (result === -1) {
            obj.priority = 'Not defined';
        }
        pushArrayChangesToLS();
    });  
}

const dataJson = dataJsonObj();

const pushArrayToLSWhenAppLoaded = () => {
    if (localStorage.getItem('todoDataObj')) {
        getArrayFromLS();
    }

    localStorage.setItem('todoDataObj', JSON.stringify(todoData));   
}

const pushArrayChangesToLS = () => {
    let todoDataObj = JSON.stringify(todoData);
    localStorage.setItem('todoDataObj', todoDataObj);    
}

const getArrayFromLS = () => {
    todoData = JSON.parse(localStorage.getItem('todoDataObj'));    
}

const getRandomId = (min, max) => {
    const randomValue = parseInt(Math.random() * (max - min) + min);
    return randomValue;
}

const showTableOnLoad = () => {
    let title = 'TODO List';

    $(`<div class="header"><h1 class="title">${title}</h1></div>`).appendTo('#wrapper');
    $('<div class="body-list"></div>').appendTo('#wrapper');
    $('<button type="button" class="add-button" data-name="addBtn" data-toggle="tooltip" title="Add new item in list">+</button> ').appendTo('#wrapper');    

    showToDoList();
    addEventListenerToTable();
}

const showToDoList = () => {
    $('.row').remove();    
    getArrayFromLS();
    let idItem;

    todoData.forEach((itemObj) => {
        $(`<div class="row ${itemObj.status}" data-id="${itemObj.id}">
            <div class="cell cell-date"><span>${itemObj.date}</span></div>
            <div class="cell cell-title">${itemObj.title}</div>
            <div class="cell cell-priority ${itemObj.priority}" data-priority="${itemObj.priority}">${itemObj.priority}</div>
            <div class="cell cell-status">${itemObj.status}</div>
            <div class="cell cell-description">${itemObj.description}</div>
            <div class="cell cell-buttons">
                <button type="button" class="row-button btn-edit" data-id="${itemObj.id}" data-name="editBtn" data-toggle="tooltip" title="Push to edit item">Edit</button>
                <button type="button" class="row-button btn-delete" data-toggle="modal" data-target="#exampleModal">Delete</button>
            </div>
        </div>`).appendTo('.body-list');
        idItem = itemObj.id;
    });

    $(`<div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">      
                <div class="modal-body">
                    Confirm delete to delete item
                </div>
            <div class="modal-footer">
                <button type="button" class="row-button" data-dismiss="modal" data-toggle="tooltip" title="Push to close">Close</button>
                <button type="button" class="row-button btn-delete" data-dismiss="modal" data-id="${idItem}" data-name="deleteBtn" data-toggle="tooltip" title="Push to delete item">Delete</button>
            </div>
        </div>
    </div>
    </div>`).appendTo('#wrapper');
}

const addEventListenerToTable = () => {
    let newIdItem;

    $(document).ready(function() {
        $('#wrapper').click(function(e) {
            const btn = e.target.getAttribute('data-name');
            const currentId = e.target.getAttribute('data-id');
    
            if (!btn) {return;}
            
            switch (btn) {
                case 'addBtn':
                    newIdItem = showFormToAddNewListItem();
                    break;
                
                case 'closeBtn':
                    $('#form').remove();
                    break;
                    
                case 'submitBtn':
                    formValidation(newIdItem);                                    
                    break;
    
                case 'deleteBtn':
                    delteItem(currentId);                    
                    break;
    
                case 'editBtn':                    
                    editList(currentId);
                    break;
            }
        });
    });
}

const delteItem = (currentId) => {    
    for (let i = 0; i < todoData.length; i++) {                
        if (+currentId === todoData[i].id) {
            todoData.splice(i, 1);
        }
    }

    pushArrayChangesToLS();
    clearBody('.body-list');
    showToDoList();

    $(`<div class="alert alert-success alert-dismissible fade show" role="alert">
        <strong>Success! Item deleted</strong>
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>`).appendTo('#wrapper');
}

const clearBody = (element) => {
    document.querySelector(element).innerHTML = '';
}

const showFormToAddNewListItem = () => {
    clearBody('.body-list');
    showToDoList();

    const dataNow = moment().format("DD-MM-YYYY, HH:mm");
    const id = getRandomId(0, 100);

    $(`<form class="form show" id="form">
            <h2 class="form-title">Add new item</h2>
            <label class="label">ID: ${ id }<input style="display: none" name="id" value="${id}"></label>
            <label class="label">Data: <input name="date" value="${dataNow}"></label>
            <label class="label">Title: <input type="text" name="title" id="title" placeholder="Write something"></label>
            <label class="label">Priority: <select name="priorities" id="priorities"></select></label>
            <label class="label">Statuses: <select name="statuses" id="statuses"></select></label>
            <label class="label">Description: <textarea name="description" id="description" cols="15" rows="5"></textarea></label>
        </form>`).appendTo('.body-list');

    addButton('submit-button', 'submitBtn', 'Save', '#form');
    addButton('close-button', 'closeBtn', 'X', '#form');    
    addOptionsInSelect(dataJson.statuses, 'priorities');
    addOptionsInSelect(dataJson.priorities, 'statuses');

    return id;
}

const addButton = (btnClass, dataName, text, parentId, tooltipText) => {
    $('<button />', {
        type: 'button', 
        class: btnClass, 
        'data-name': dataName,
        text: text,
        'data-toggle': "tooltip",
        title: tooltipText
    }).appendTo(parentId);
}

const addOptionsInSelect = (array, select) => {    
    const selectParent = document.getElementById(select);

    array.forEach(function(item) {
        selectParent.insertAdjacentHTML('beforeend', '<option value="' + item + '">' + item + '</option>');
    });
}

const formValidation = (id) => {
    const formElem = document.forms.form.elements;    
    let result;
    
    const patternObj = {
        title: /^\w+[\s,\-]?\w*[\s,\-]?\w*[\s,\-]?\w*[\!,\?,\:,\,,\.,\...]*$/,
        description: /[\w\s\.!?@#,-_''""<>\/\\:;=+*^&$]/
    };
    
    for (let i = 0; i < formElem.length; i++) {
        for (let key in patternObj) {
            if (formElem[i].name === key) {
                result = patternObj[key].test(formElem[i].value);                
                
                if (!result) {
                    formElem[i].classList.add('error');                    
                    return;
                } else {
                    formElem[i].classList.remove('error');
                }
            }
        }
    }

    getDataFromForm(id);
}

const getDataFromForm = () => {
    const form = document.forms.form;
    const id = form.elements.id.value;
    const date = form.elements.date.value;
    const title = form.elements.title.value;
    const priority = form.elements.priorities.value;
    const status = form.elements.statuses.value;
    const description = form.elements.description.value;
    
    saveItem(id, date, title, priority, status, description);   
}

const saveItem = (currentId, date, title, priority, status, description) => {
    let id = +currentId;
    let result = todoData.findIndex(itemObj => itemObj.id === id);    
    
    if (result === -1) {
        let currentItem = new NewItem(id, date, title, priority, status, description);
        todoData.push(currentItem);
    } else if (result !== -1) {
        todoData.forEach((obj) => {
            if (obj.id === id) {
                obj.date = date;
                obj.title = title;
                obj.priority = priority;
                obj.status = status;
                obj.description = description;
            }
        });   
    }
    
    pushArrayChangesToLS();
    $('#form').remove();
    showToDoList();
}

const editList = (currentId) => {
    clearBody('.body-list');
    showToDoList();

    for (let i = 0; i < todoData.length; i++) {
        if (+currentId === todoData[i].id) {
            $(`<form class="form show" id="form">
                    <h2 class="form-title">Edit item</h2>
                    <label class="label">ID: ${ currentId }<input style="display: none" name="id" value="${ currentId }"></label>
                    <label class="label">Data: <input name="date" value="${todoData[i].date}"></label>
                    <label class="label">Title: <input type="text" name="title" id="title" value="${todoData[i].title}"></label>
                    <label class="label">Priority: <select name="priorities" id="priorities" selected></select></label>
                    <label class="label">Statuses: <select name="statuses" id="statuses"></select></label>
                    <label class="label">Description: <textarea name="description" id="description" cols="15" rows="5">${todoData[i].description}</textarea></label>
                </form>`).appendTo('.body-list');
        }        
    }        

    addButton('submit-button', 'submitBtn', 'Save', '#form', 'Save changes');
    addButton('close-button', 'closeBtn', 'X', '#form', 'Close window');
    addOptionsInSelect(dataJson.priorities, 'priorities');
    addOptionsInSelect(dataJson.statuses, 'statuses');
}

const runTooltips = () => {
    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });
}
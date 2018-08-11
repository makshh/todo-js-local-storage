// Todo App

var TODO = (function(window, document, $) {

  var errorEl = $('#error');
  var categoriesEmpty = $('.categories-empty-sidebar, .categories-empty-main');
  var tasksWrapper = $('.tasks-wrapper');

  // Check local storage support
  if (!store.enabled) {
    errorEl.text('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.');
    errorEl.show();
    return;
  }

  var tasks = {};
  var categories = {};

  var module = {};

  module.init = function() {
    module.getAllTasks();
    module.getAllCategories();
    module.bindUiEvents();
    module.prepareView();
    module.showTasks(0);
  };

  module.prepareView = function() {
    if(!(Object.keys(categories).length === 0 && categories.constructor === Object)) {
      module.showCategories();
      categoriesEmpty.attr('hidden', true);
      tasksWrapper.removeAttr('hidden');
    }
  };

  module.bindUiEvents = function() {

    // Add new category
    $('.add-new-category-btn').on('click', function() {
      var category = $('#new-category').val();
      if(!category) {
        errorEl.text('Category name cannot be empty');
        errorEl.show();
        return;
      }
      module.addCategory(category);
    });

    // Add new task
    $('#new-task').on('click', function() {
      var categoryId = parseInt($('.categories-menu').find('.active').attr('data-category-id'), 10);
      var content = $('#content').val();
      if(!content) {
        errorEl.text('Task cannot be empty');
        errorEl.show();
        return;
      }
      var content = $('#content').val();
      var categoryId = categoryId;
      module.add(content, categoryId);
    });

    $(document).on('click', '.categories-menu .btn-category-text', function() {
      $('.categories-menu .btn').parent().removeClass('active');
      $(this).parent().addClass('active');
      var categoryId = parseInt($(this).parent().attr('data-category-id'), 10);
      module.showTasks(categoryId);
    });

    $(document).on('click', '.btn-category-edit', function() {
      var categoryId = $(this).parent().attr('data-category-id');
      var name = $(this).parent().find('.btn-category-text').text();
      $('#edit-category').val(name);
      $('#category-edit-modal').modal('show');
      $('.category-edit-btn').attr('data-category-id', categoryId);
    });

    $('.category-edit-btn').on('click', function() {
      var categoryId = parseInt($(this).attr('data-category-id'), 10);
      var name = $('#edit-category').val();
      module.editCategory(categoryId, name);
    });

    $('#category-edit-modal').on('shown.bs.modal', function() {
      $(this).find('.form-control').focus();
    });

    $(document).on('click', '.btn-category-remove', function() {
      var categoryId = $(this).parent().attr('data-category-id');
      $('.category-remove-btn').attr('data-category-id', categoryId);
      $('#category-remove-modal').modal('show');
    });

    $('.category-remove-btn').on('click', function() {
      var categoryId = parseInt($(this).attr('data-category-id'), 10);
      module.removeCategory(categoryId);
    });

    $('.categories-empty-main').on('click', function() {
      $('#new-category').addClass('add-category-input-animation').focus();
      setTimeout(function() {
        $('#new-category').removeClass('add-category-input-animation')
      }, 1000);
    });

    $('.mobile-menu').on('click', function() {
      $(this).toggleClass('active');
      $('.categories-sidebar').toggleClass('active');
    });

    $('#new-category').keypress(function(event) {
      if(event.keyCode == 13){
        $('.add-new-category-btn').trigger('click');
      }
    });

    $('#content').keypress(function(event) {
      if(event.keyCode == 13) {
        $('.add-new-task-btn').trigger('click');
      }
    });
  };

  // Get all tasks
  module.getAllTasks = function() {
    if(store.get('tasks')) {
      tasks = store.get('tasks');
    } else {
      tasks = {};
      store.set('tasks', tasks);
    }
    return tasks;
  };

  // Get all categories
  module.getAllCategories = function() {
    if(store.get('categories')) {
      categories = store.get('categories');
    } else {
      categories = {};
      store.set('categories', categories);
    }
    return categories;
  };

  // Show categories
  module.showCategories = function() {
    var html = '';
    for(var key in categories) {
      if (!categories.hasOwnProperty(key)) {
        continue;
      }
      var obj = categories[key];
      html += '<li class="d-flex align-items-center" data-category-id="' + key + '">' +
                  '<button type="button" class="btn btn-category btn-category-text mr-auto">' + obj + '</button>' +
                  '<button type="button" class="btn btn-category btn-category-edit"><i class="fas fa-edit"></i></button>' +
                  '<button type="button" class="btn btn-category btn-category-remove"><i class="fas fa-times"></i></button>' +
                '</li>';
    }
    $(html).appendTo('.categories-menu');
    $('.categories-menu').find('li:first').addClass('active');
  }

  // Show tasks
  module.showTasks = function(categoryId) {
    $('.tasks').empty();
    var html = '';
    for(var key in tasks) {
      if (!tasks.hasOwnProperty(key)) {
        continue;
      }
      var obj = tasks[key];
      if(obj.categoryId !== categoryId) {
        continue;
      }
      html += '<div class="task" data-id="' + key + '"' + 'data-category-id="' + obj.categoryId + '">' + obj.content + '</div>';
    }
    $(html).appendTo('.tasks');
  };

  // Add new task
  module.add = function(content, categoryId) {
    var data = {
      content: content,
      categoryId: categoryId,
      done: 0
    };
    tasks[module.getNumberOfTasks()] = data;
    module.saveTasks();
  };

  // Add new category
  module.addCategory = function(name) {
    var html = '<li class="d-flex align-items-center" data-category-id="' + module.getNumberOfCategories() + '">' +
                  '<button type="button" class="btn btn-category btn-category-text mr-auto">' + name + '</button>' +
                  '<button type="button" class="btn btn-category btn-category-edit"><i class="fas fa-edit"></i></button>' +
                  '<button type="button" class="btn btn-category btn-category-remove"><i class="fas fa-times"></i></button>' +
                '</li>';
    categories[module.getNumberOfCategories()] = name;
    module.saveCategories();
    $(html).appendTo('.categories-menu');
    $('.categories-menu > li').removeClass('active');
    $('.categories-menu').find('li:last').addClass('active');
    $('.tasks').empty();
    categoriesEmpty.attr('hidden', true);
    tasksWrapper.removeAttr('hidden');
  };

  // Get number of tasks
  module.getNumberOfTasks = function() {
    return Object.keys(tasks).length;
  };

  // Get number of categories
  module.getNumberOfCategories = function() {
    return Object.keys(categories).length;
  };

  // Get number of tasks done
  module.getNumberOfTasksDone = function() {
    var numberOfTasksDone = 0;
    tasks.forEach(function(task) {
      if(task.done === 1) {
        numberOfTasksDone++;
      }
    });
    return numberOfTasksDone;
  };

  // Get number of tasks done in percents
  module.numberOfTasksDonePercent = function() {
    if(module.getNumberOfTasksDone() === 0) {
      return '0%';
    } else {
      return parseInt((module.getNumberOfTasksDone() / module.getNumberOfTasks()) * 100, 10) + '%';
    }
  };

  // Get number of tasks not done
  module.getNumberOfTasksDone = function() {
    var numberOfTasksNotDone = 0;
    tasks.forEach(function(task) {
      if(task.done === 0) {
        numberOfTasksNotDone++;
      }
    });
    return numberOfTasksNotDone;
  };

  // Mark as done
  module.markAsDone = function(id) {
    tasks[id].done = 1;
    module.saveTasks();
  };

  // Mark as not done
  module.markAsNotDone = function(id) {
    tasks[id].done = 0;
    module.saveTasks();
  };

  // Save tasks to local storage
  module.saveTasks = function() {
    store.set('tasks', tasks);
  };

  // Save tasks to local storage
  module.saveCategories = function() {
    store.set('categories', categories);
  };

  // Edit task
  module.editTask = function(id, content) {
    tasks[id].name = name;
    module.saveTasks();
  };

  // Remove task
  module.removeTask = function(id) {
    delete tasks[id];
    module.saveTasks();
  };

  // Edit category
  module.editCategory = function(id, name) {
    categories[id] = name;
    $('.categories-menu [data-category-id="' + id + '"]').find('.btn-category-text').text(name);
    module.saveCategories();
  };

  // Remove category
  module.removeCategory = function(id) {
    delete categories[id];
    var removed = $('li[data-category-id="' + id + '"]');
    if(removed.hasClass('active')) {
      $('.categories-menu > li:first').addClass('active');
      module.showTasks(0);
    }
    for(var key in tasks) {
      if (!tasks.hasOwnProperty(key)) {
        continue;
      }
      var obj = tasks[key];
      for (var prop in obj) {
        if(!obj.hasOwnProperty(prop)) {
          continue;
        }
        if(obj.categoryId === id) {
          module.removeTask(id);
        }
      }
    }
    removed.remove();
    if(Object.keys(categories).length === 0 && categories.constructor === Object) {
      categoriesEmpty.removeAttr('hidden');
      tasksWrapper.attr('hidden', true);
    }
    module.saveCategories();
  };

  return module;

})(window, document, jQuery);

$(window).on('load', function() {
  $('.loader').removeClass('active');
});

TODO.init();

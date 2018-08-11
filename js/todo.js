// Todo App

var TODO = (function(window, document, $) {

  // Check local storage support
  if (!store.enabled) {
    alert('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.');
    return;
  }

  var tasks = [];
  var categories = [];

  var module = {};

  module.init = function() {
    module.getAllTasks();
    module.getAllCategories();
    module.bindUiEvents();
    module.prepareView();
    module.showTasks(0);
  };

  module.prepareView = function() {
    if(categories) {
      module.showCategories();
    }
  };

  module.bindUiEvents = function() {

    // Add new category
    $('.add-new-category-btn').on('click', function() {
      var category = $('#new-category').val();
      if(!category) {
        alert('Category name cannot be empty');
        return;
      }
      module.addCategory(category);
    });

    // Add new task
    $('#new-task').on('click', function() {
      var categoryId = parseInt($('.categories-menu').find('.active').attr('data-category-id'), 10);
      var content = $('#content').val();
      if(!content) {
        alert('Task cannot be empty');
        return;
      }
      var content = $('#content').val();
      var categoryId = categoryId;
      var comment = $('#comment').val();
      module.add(content, categoryId, comment);
    });

    $(document).on('click', '.categories-menu .btn-category-text', function() {
      $('.categories-menu .btn').parent().removeClass('active');
      $(this).parent().addClass('active');
      var categoryId = $(this).parent().attr('data-category-id');
      module.showTasks(categoryId);
    });

    $(document).on('click', '.btn-category-remove', function() {
      var categoryId = $(this).parent().attr('data-category-id');
      module.removeCategory(categoryId);
      $(this).parent().remove();
    });
  };

  // Get all tasks
  module.getAllTasks = function() {
    if(store.get('tasks')) {
      tasks = store.get('tasks');
    } else {
      tasks = [];
      tasks = store.set('tasks', tasks);
    }
    return tasks;
  };

  // Get all categories
  module.getAllCategories = function() {
    if(store.get('categories')) {
      categories = store.get('categories');
    } else {
      categories = [];
      categories = store.set('categories', categories);
    }
    return categories;
  };

  // Show categories
  module.showCategories = function() {
    var html = '';
    categories.forEach(function(category, index) {
      html += '<li class="d-flex align-items-center" data-category-id="' + index + '">' +
                '<button type="button" class="btn btn-category btn-category-text mr-auto">' + category + '</button>' +
                '<button type="button" class="btn btn-category btn-category-edit"><i class="fas fa-edit"></i></button>' +
                '<button type="button" class="btn btn-category btn-category-remove"><i class="fas fa-times"></i></button>' +
              '</li>';
    });
    $(html).appendTo('.categories-menu');
    $('.categories-menu').find('li:first').addClass('active');
  }

  // Show tasks
  module.showTasks = function(categoryId) {
    $('.tasks').empty();
    var html = '';
    tasks.forEach(function(task, index) {
      if(task.categoryId != categoryId) {
        return;
      }
      var comment = '';
      if(task.comment) {
        comment = 'data-tooltip="true" title="' + task.comment + '"';
      }
      html += '<div class="task" data-id="' + index + '"' + comment + ' data-category-id="' + task.categoryId + '">' + task.content + '</div>'
    });
    $(html).appendTo('.tasks');
  };

  // Add new task
  module.add = function(content, categoryId, comment) {
    var data = {
      content: content,
      categoryId: categoryId,
      comment: comment,
      done: 0
    };
    tasks.push(data);
    module.saveTasks();
  };

  // Add new category
  module.addCategory = function(name) {
    var html = '<li class="d-flex align-items-center" data-category-id="' + categories.length + '">' +
                  '<button type="button" class="btn btn-category btn-category-text mr-auto">' + name + '</button>' +
                  '<button type="button" class="btn btn-category btn-category-edit"><i class="fas fa-edit"></i></button>' +
                  '<button type="button" class="btn btn-category btn-category-remove"><i class="fas fa-times"></i></button>' +
                '</li>';
    categories.push(name);
    module.saveCategories();
    $(html).appendTo('.categories-menu');
    $('.categories-menu > li').removeClass('active');
    $('.categories-menu').find('li:last').addClass('active');
    $('.tasks').empty();
  };

  // Get number of tasks
  module.getNumberOfTasks = function() {
    return tasks.length;
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
  module.editTask = function(id, content, comment) {
    tasks[id].name = name;
    tasks[id].comment = comment;
    module.saveTasks();
  };

  // Remove task
  module.removeTask = function(id) {
    tasks.splice(id, 1);
    module.saveTasks();
  };

  // Edit category
  module.editCategory = function(id, name) {
    categories[id].name = name;
    module.saveCategories();
  };

  // Remove category
  module.removeCategory = function(id) {
    categories.splice(id, 1);
    var removed = $('li[data-category-id="' + id + '"]');
    var nextAll = removed.nextAll();
    nextAll.each(function() {
      $(this).attr('data-category-id', parseInt($(this).attr('data-category-id')) - 1);
    });
    module.saveCategories();
  };

  return module;

})(window, document, jQuery);

TODO.init();

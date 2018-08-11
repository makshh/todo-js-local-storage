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
    module.showTasks();
  };

  module.prepareView = function() {
    if(categories) {
      categories.forEach(function(category, index) {
        $('#category-select').append($('<option>', {
          value: index,
          text: category
        }));
      });
      $('.categories-wrapper').removeAttr('hidden');
      $('.task-wrapper').removeAttr('hidden');
      $('.comment-wrapper').removeAttr('hidden');
    }
    if(tasks) {
      $('.tasks').removeAttr('hidden');
    }
  };

  module.bindUiEvents = function() {

    // Add new category
    $('#new-category').on('click', function() {
      //var category = $('#category').val();
      //if(!category) {
      //  alert('Category name cannot be empty');
      //  return;
      //}
      //module.addCategory($('#category').val());
    });

    // Add new task
    $('#new-task').on('click', function() {
      var categoryId = $('#category-select').val();
      var content = $('#content').val();
      if(!categoryId) {
        alert('Category name cannot be empty');
        return;
      }
      if(!content) {
        alert('Task cannot be empty');
        return;
      }
      module.add($('#content').val(), $('#category-select').val(), $('#comment').val());
    });

    $(document).on('click', '.categories-menu .btn', function() {
      $('.categories-menu .btn').parent().removeClass('active');
      $(this).parent().addClass('active');
    });
  };

  // Get all tasks
  module.getAllTasks = function() {
    tasks = store.get('tasks') || [];
    return tasks;
  };

  // Get all categories
  module.getAllCategories = function() {
    categories = store.get('categories') || [];
    return categories;
  };

  // Show tasks
  module.showTasks = function() {
    var html = '';
    tasks.forEach(function(task, index) {
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
    categories.push(name);
    module.saveCategories();
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

  // Remove task
  module.removeTask = function(id) {
    tasks.splice(id, 1);
    module.saveTasks();
  };

  // Remove category
  module.removeCategory = function(id) {
    categories.splice(id, 1);
    module.saveCategories();
  };

  return module;

})(window, document, jQuery);

TODO.init();
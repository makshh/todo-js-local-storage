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

  // Get all tasks
  module.getAllTasks = function() {
    tasks = store.get('tasks');
    return tasks;
  }

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
  }

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
  },

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
  }

  // Save tasks to local storage
  module.saveCategories = function() {
    store.set('categories', categories);
  }

  // Remove task
  module.removeTask = function(id) {
    tasks.splice(id, 1);
    module.saveTasks();
  }

  // Remove category
  module.removeCategory = function(id) {
    categories.splice(id, 1);
    module.saveCategories();
  }

  return module;

})(window, document, jQuery);
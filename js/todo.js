// Todo App

var TODO = (function(window, document, $) {

  // Check local storage support
  if (!store.enabled) {
    alert('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.');
    return;
  }

  var tasks = [];

  var module = {};

  // Add new task
  module.add = function(content, categoryId, comment) {
    var data = {
      content: content,
      categoryId: categoryId,
      comment: comment,
      done: 0
    };
    tasks[module.getNumberOfTasks()] = data;
    store.set('tasks', tasks);
  }

  // Get number of tasks
  module.getNumberOfTasks = function() {
    return tasks.length;
  }

  // Get number of tasks done
  module.getNumberOfTasksDone = function() {
    var numberOfTasksDone = 0;
    tasks.forEach(function(task) {
      if(task.done === 1) {
        numberOfTasksDone++;
      }
    });
    return numberOfTasksDone;
  }

  return module;

})(window, document, jQuery);
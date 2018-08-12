// Todo App

var TODO = (function(window, document, $) {

  var errorEl = $('#error');
  var categoriesEmpty = $('.categories-empty-sidebar, .categories-empty-main');
  var tasksWrapper = $('.tasks-wrapper');

  // Check local storage support
  if (!store.enabled) {
    errorEl.find('> span').text('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.');
    errorEl.velocity('fadeIn');
    return;
  }

  var tasks = {};
  var categories = {};

  var module = {};

  module.init = function() {
    module.getAllTasks();
    module.getAllCategories();
    module.bindUiEvents();
    var categoryActive = 0;
    if(store.get('category') !== undefined) {
      categoryActive = store.get('category');
    }
    module.prepareView(categoryActive);
    module.showTasks(categoryActive);
  };

  module.prepareView = function(category) {
    if(!(Object.keys(categories).length === 0 && categories.constructor === Object)) {
      module.showCategories(category);
      categoriesEmpty.attr('hidden', true);
      tasksWrapper.removeAttr('hidden');
    }
  };

  module.bindUiEvents = function() {

    // Add new category
    $('.add-new-category-btn').on('click', function() {
      var category = $('#new-category').val();
      if(!category) {
        errorEl.find('> span').text('Category name cannot be empty');
        errorEl.velocity('fadeIn', {
          complete: function() {
            setTimeout(function() {
              errorEl.velocity('fadeOut');
            }, 2000);
          }
        });
        return;
      }
      module.addCategory(category);
    });

    // Add new task
    $('#new-task').on('click', function() {
      var categoryId = parseInt($('.categories-menu').find('.active').attr('data-category-id'), 10);
      var content = $('#content').val();
      if(!content) {
        errorEl.find('> span').text('Task cannot be empty');
        errorEl.velocity('fadeIn', {
          complete: function() {
            setTimeout(function() {
              errorEl.velocity('fadeOut');
            }, 2000);
          }
        });
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
      $('.tasks').attr('hidden', true);
      $('.category-name').text($(this).text());
      module.showTasks(categoryId);
      module.setCategoryView(categoryId);
    });

    $(document).on('click', '.btn-category-edit', function() {
      var categoryId = $(this).parent().attr('data-category-id');
      var name = $(this).parent().find('.btn-category-text').text();
      $('#edit-category').val(name);
      $('#category-edit-modal').modal('show');
      $('.category-edit-btn').attr('data-category-id', categoryId);
    });

    $(document).on('click', '.btn-task-edit', function() {
      var task = $(this).closest('.task');
      var taskId = task.attr('data-id');
      var name = task.find('.task-content').text();
      $('#edit-task').val(name);
      $('#task-edit-modal').modal('show');
      $('.task-edit-btn').attr('data-id', taskId);
    });

    $('.category-edit-btn').on('click', function() {
      var categoryId = parseInt($(this).attr('data-category-id'), 10);
      var name = $('#edit-category').val();
      if(name === '') {
        errorEl.find('> span').text('Category name cannot be empty');
        errorEl.velocity('fadeIn', {
          complete: function() {
            setTimeout(function() {
              errorEl.velocity('fadeOut');
            }, 2000);
          }
        });
        return;
      }
      $('#category-edit-modal').modal('hide');
      module.editCategory(categoryId, name);
    });

    $('.task-edit-btn').on('click', function() {
      var taskId = parseInt($(this).attr('data-id'), 10);
      var content = $('#edit-task').val();
      if(content === '') {
        errorEl.find('> span').text('Task cannot be empty');
        errorEl.velocity('fadeIn', {
          complete: function() {
            setTimeout(function() {
              errorEl.velocity('fadeOut');
            }, 2000);
          }
        });
        return;
      }
      $('#task-edit-modal').modal('hide');
      module.editTask(taskId, content);
    });

    $('#category-edit-modal, #task-edit-modal').on('shown.bs.modal', function() {
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

    $(document).on('click', '.btn-task-remove', function() {
      var taskId = $(this).closest('.task').attr('data-id');
      $('.task-remove-btn').attr('data-id', taskId);
      $('#task-remove-modal').modal('show');
    });

    $('.task-remove-btn').on('click', function() {
      var taskId = parseInt($(this).attr('data-id'), 10);
      var categoryId = parseInt($('.categories-menu').find('.active').attr('data-category-id'), 10);
      module.removeTask(taskId, categoryId);
    });

    $('.categories-empty-main').on('click', function() {
      if($(window).width() < 992) {
        $('.categories-sidebar, .mobile-menu').addClass('active');
      }
      $('#new-category').addClass('add-category-input-animation').focus();
      setTimeout(function() {
        $('#new-category').removeClass('add-category-input-animation');
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

    $('#edit-category').keypress(function(event) {
      if(event.keyCode == 13) {
        $('.category-edit-btn').trigger('click');
      }
    });

    $('#edit-task').keypress(function(event) {
      if(event.keyCode == 13) {
        $('.task-edit-btn').trigger('click');
      }
    });

    $(document).on('click', '.btn-task-done', function() {
      var task = $(this).closest('.task');
      var taskId = parseInt(task.attr('data-id'), 10);
      if(tasks[taskId].done === 0 || tasks[taskId].done === 2) {
        tasks[taskId].done = 1;
        task.removeClass('working').addClass('done');
      } else {
        tasks[taskId].done = 0;
        task.removeClass('done');
      }
      module.saveTasks();
    });

    $(document).on('click', '.btn-task-active', function() {
      var task = $(this).closest('.task');
      var taskId = parseInt(task.attr('data-id'), 10);
      if(tasks[taskId].done === 0 || tasks[taskId].done === 1) {
        tasks[taskId].done = 2;
        task.removeClass('done').addClass('working');
      } else {
        tasks[taskId].done = 0;
        task.removeClass('working');
      }
      module.saveTasks();
    });

    $(document).on('click', '#error > button', function() {
      errorEl.velocity('fadeOut');
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
  module.showCategories = function(categoryId) {
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
    $('.categories-menu').find('[data-category-id="' + categoryId + '"]').addClass('active');
  }

  // Show tasks
  module.showTasks = function(categoryId) {
    $('.tasks-category-empty').removeAttr('hidden').show();
    $('.tasks').empty();
    $('.category-name').text($('.categories-menu [data-category-id="' + categoryId + '"] > .btn-category-text').text());
    if(Object.keys(tasks).length === 0 && tasks.constructor === Object) {
      return;
    }
    var html = '';
    for(var key in tasks) {
      if (!tasks.hasOwnProperty(key)) {
        continue;
      }
      var task = tasks[key];
      if(task.categoryId !== categoryId) {
        continue;
      }
      $('.tasks').removeAttr('hidden');
      $('.tasks-category-empty').attr('hidden', true);
      var done = '';
      if(task.done === 1) {
        done = 'done';
      }
      if(task.done === 2) {
        done = 'working';
      }
      html += '<div class="task d-flex flex-column flex-lg-row justify-content-between align-items-lg-center ' + done + '" data-id="' + key + '"' + 'data-category-id="' + task.categoryId + '">' +
                '<div class="task-content order-last order-lg-first">' + task.content + '</div>' +
                '<div class="mb-2 mb-lg-0">' +
                  '<button type="button" class="btn btn-task btn-task-done"><i class="fas fa-check"></i></button>' +
                  '<button type="button" class="btn btn-task btn-task-active"><i class="fas fa-cogs"></i></button>' +
                  '<button type="button" class="btn btn-task btn-task-edit"><i class="fas fa-edit"></i></button>' +
                  '<button type="button" class="btn btn-task btn-task-remove"><i class="fas fa-times"></i></button>' +
                '</div>' +
              '</div>';
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
    var taskLastId = module.getTaskLastId();
    var taskId = taskLastId + 1;
    tasks[taskId] = data;
    module.saveTasks();
    var html = '<div class="task d-flex flex-column flex-lg-row justify-content-between align-items-lg-center" data-id="' + taskId + '"' + 'data-category-id="' + categoryId + '">' +
                  '<div class="task-content order-last order-lg-first">' + content + '</div>' +
                  '<div class="mb-2 mb-lg-0">' +
                    '<button type="button" class="btn btn-task btn-task-done"><i class="fas fa-check"></i></button>' +
                    '<button type="button" class="btn btn-task btn-task-active"><i class="fas fa-cogs"></i></button>' +
                    '<button type="button" class="btn btn-task btn-task-edit"><i class="fas fa-edit"></i></button>' +
                    '<button type="button" class="btn btn-task btn-task-remove"><i class="fas fa-times"></i></button>' +
                  '</div>' +
                '</div>';
    $(html).appendTo('.tasks');
    if($('.tasks').attr('hidden')) {
      $('.tasks-category-empty').velocity('slideUp');
      $('.tasks').removeAttr('hidden');
      $('.tasks').velocity('slideDown');
    } else {
      $('.task[data-id="' + taskId + '"]').velocity('slideDown');
    }
    $('#content').val('');
  };

  // Add new category
  module.addCategory = function(name) {
    var categoryLastId = module.getCategoryLastId();
    var categoryId = categoryLastId + 1;
    var html = '<li class="d-flex align-items-center" data-category-id="' + categoryId + '">' +
                  '<button type="button" class="btn btn-category btn-category-text mr-auto">' + name + '</button>' +
                  '<button type="button" class="btn btn-category btn-category-edit"><i class="fas fa-edit"></i></button>' +
                  '<button type="button" class="btn btn-category btn-category-remove"><i class="fas fa-times"></i></button>' +
                '</li>';
    categories[categoryId] = name;
    module.saveCategories();
    $('.category-name').text(name);
    $(html).appendTo('.categories-menu');
    $('.categories-menu [data-category-id="' + categoryId + '"]').velocity('slideDown');
    $('.categories-menu > li').removeClass('active');
    $('.categories-menu').find('li:last').addClass('active');
    $('.tasks').empty();
    $('.tasks').attr('hidden', true);
    categoriesEmpty.velocity('slideUp', {
      complete: function() {
        categoriesEmpty.attr('hidden', true);
      }
    });
    $('.tasks-category-empty');
    if(tasksWrapper.attr('hidden')) {
      tasksWrapper.removeAttr('hidden');
      tasksWrapper.velocity('slideDown')
    }
    module.setCategoryView(categoryId);
    $('#new-category').val('');
  };

  // Get number of tasks
  module.getNumberOfTasks = function() {
    return Object.keys(tasks).length;
  };

  // Get last task id
  module.getTaskLastId = function() {
    if(Object.keys(tasks).length === 0 && tasks.constructor === Object) {
      return -1;
    }
    var keys = [];
    Object.keys(tasks).forEach(function(key) {
      keys.push(key);
    });
    return Math.max(...keys);
  };

  // Get last category id
  module.getCategoryLastId = function() {
    if(Object.keys(categories).length === 0 && categories.constructor === Object) {
      return -1;
    }
    var keys = [];
    Object.keys(categories).forEach(function(key) {
      keys.push(key);
    });
    return Math.max(...keys);
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

  // Set category view
  module.setCategoryView = function(categoryId) {
    store.set('category', categoryId)
  }

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
    tasks[id].content = content;
    $('.tasks [data-id="' + id + '"]').find('.task-content').text(content);
    module.saveTasks();
  };

  // Remove task
  module.removeTask = function(id, categoryId) {
    delete tasks[id];
    $('.tasks [data-id="' + id + '"]').velocity('slideUp', {
      complete: function() {
        $('.tasks [data-id="' + id + '"]').remove()
      }
    });
    var numberOfTasksInCategory = 0;
    for(var key in tasks) {
      if (!tasks.hasOwnProperty(key)) {
        continue;
      }
      var task = tasks[key];
      console.log(task)
      if(task.categoryId === categoryId) {
        numberOfTasksInCategory += 1;
      }
    }
    if(numberOfTasksInCategory === 0) {
      $('.tasks').velocity('slideUp', {
        complete: function() {
          $('.tasks').attr('hidden', true);
        }
      })
      $('.tasks-category-empty').removeAttr('hidden').velocity('slideDown');
    }
    module.saveTasks();
  };

  // Edit category
  module.editCategory = function(id, name) {
    categories[id] = name;
    var activeCategoryId = parseInt($('.categories-menu .active').attr('data-category-id'), 10);
    if(id === activeCategoryId) {
      $('.category-name').text(name);
    }
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
      module.setCategoryView(0);
    }

    // Remove tasks from category
    for(var key in tasks) {
      if (!tasks.hasOwnProperty(key)) {
        continue;
      }
      var task = tasks[key];
      if(task.categoryId === id) {
        module.removeTask(key, id);
      }
    }
    removed.velocity('slideUp', {
      complete: function() {
        removed.remove();
      }
    });
    if(Object.keys(categories).length === 0 && categories.constructor === Object) {
      categoriesEmpty.removeAttr('hidden').velocity('slideDown');
      tasksWrapper.attr('hidden', true);
    }
    module.saveCategories();
  };

  module.showError = function(message, el) {
    var error = $('#error');
    errorEl.find('> span').text('Category name cannot be empty');
    errorEl.velocity('fadeIn', {
      complete: function() {
        setTimeout(function() {
          errorEl.velocity('fadeOut');
        }, 2000);
      }
    });
  }

  return module;

})(window, document, jQuery);

TODO.init();

$(window).on('load', function() {
  $('.loader').removeClass('active');
});

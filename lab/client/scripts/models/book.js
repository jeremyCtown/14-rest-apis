'use strict';

var app = app || {};
var __API_URL__ = 'http://localhost:3000'; 

(function(module) {
  function errorCallback(err) {
    console.error(err);
    module.errorView.initErrorPage(err);
  }

  function Book(rawBookObj) {
    Object.keys(rawBookObj).forEach(key => this[key] = rawBookObj[key]);
  }

  Book.prototype.toHtml = function() {
    let template = Handlebars.compile($('#book-list-template').text());
    return template(this);
  }

  Book.all = [];
  
  Book.loadAll = rows => Book.all = rows.sort((a, b) => b.title - a.title).map(book => new Book(book));
  Book.fetchAll = callback =>
    $.get(`${__API_URL__}/api/v1/books`)
      .then(Book.loadAll)
      .then(callback)
      .catch(errorCallback);

  Book.fetchOne = (ctx, callback) =>
    $.get(`${__API_URL__}/api/v1/books/${ctx.params.book_id}`)
      .then(results => ctx.book = results[0])
      .then(callback)
      .catch(errorCallback);

  Book.create = book =>
    $.post(`${__API_URL__}/api/v1/books`, book)
      .then(() => page('/'))
      .catch(errorCallback);

  Book.update = (book, bookId) =>
      $.ajax({
        url: `${__API_URL__}/api/v1/books/${bookId}`,
        method: 'PUT',
        data: book,
      })
      .then(() => page(`/books/${bookId}`))
      .catch(errorCallback)

  Book.destroy = id =>
    $.ajax({
      url: `${__API_URL__}/api/v1/books/${id}`,
      method: 'DELETE',
    })
    .then(() => page('/'))
    .catch(errorCallback)

  // COMMENT: Where is this method invoked? What is passed in as the 'book' argument when invoked? What callback will be invoked after Book.loadAll is invoked?
  // This method is being invoked in the bookView.initSearchFormPage method. The query from the search form is passed as the 'book' argument, and the callback invoked after Book.loadAll is bookView.initSearchResultsPage.
  Book.find = (book, callback) =>
    $.get(`${__API_URL__}/api/v1/books/find`, book)
      .then(Book.loadAll)
      .then(callback)
      .catch(errorCallback)

  // COMMENT: Where is this method invoked? How does it differ from the Book.find method, above?
  // This method is invoked inside bookView.initSearchResultsPage after a user has selected a new book to add to the list of books.It differs from the Book.find method because it retrieves all of the information from the API and pushes it to the db and appends it to the list.
  Book.findOne = isbn =>
    $.get(`${__API_URL__}/api/v1/books/find/${isbn}`)
    .then(Book.create)
    .catch(errorCallback)

  module.Book = Book;
})(app)

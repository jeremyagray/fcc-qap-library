'use strict';

const mongoose = require('mongoose');
const util = require('../utilities');

// Create a book and comment schema and model.
const bookSchema = new mongoose.Schema(
{
  title: {type: String, required: true},
  created_on: {type: Date, required: true, default: Date.now},
  updated_on: {type: Date, required: true, default: Date.now}
}, {toJSON: {virtuals: true}});

const commentSchema = new mongoose.Schema(
{
  bookId: {type: mongoose.ObjectId, required: true},
  comment: {type: String, required: true},
  created_on: {type: Date, required: true, default: Date.now},
  updated_on: {type: Date, required: true, default: Date.now}
});

// Add a virtual to populate comments into their book.
bookSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'bookId',
  justOne: false
});

const bookModel = mongoose.model('Book', bookSchema);
const commentModel = mongoose.model('Comment', commentSchema);

module.exports = function(app)
{

  app.route('/api/books')
    .get(async function(request, response)
    {
      try
      {
        const books = await bookModel.find({}).populate('comments');

        let data = [];
        for (let book of books)
        {
          data.push({
            'title': book['title'],
            '_id': book['_id'],
            'commentcount': book['comments'].length
          });
        }

        return response.status(200).json(data);
      }
      catch (error)
      {
        console.error(error);
        return response
        .status(500)
        .json({
          'error': 'could load books'
        });
      }
    })
    
    .post(async function(request, response)
    {
      // console.log(request.body);

      // Get title or respond immediately.
      const title = util.getValidField('title', request.body);
      
      if (title === null)
      {
        return response
        .status(500)
        .json({'error': 'no title'});
      };

      // Create and save the book.
      try
      {
        const book = new bookModel({'title': title});
        const savedBook = await book.save();

        return response.status(200).json(savedBook);
      }
      catch (error)
      {
        console.error(error);
        return response
        .status(500)
        .json({
          'error': 'could not save book'
        });
      }
    })
    
    .delete(async function(request, response)
    {
      //if successful response will be 'complete delete successful'
      try
      {
        await bookModel.findAndDelete({});
        // Really should delete comments with the books.
        // await commentModel.findAndDelete({});
        return response.status(200).json({'msg': 'complete delete successful'});
      }
      catch (error)
      {
        return response
        .status(500)
        .json({'error': 'could not delete all books'})
      }
    });



  app.route('/api/books/:id')
    .get(async function(request, response)
    {
      try
      {
        // console.log(request.params);

        // Find the book or abort.
        let book;
        const bookId = util.getValidField('id', request.params);

        if (util.isValidId(bookId))
        {
          book = await bookModel.findById(bookId).populate('comments');
        }
        else
        {
          return response.status(500).json({'error': 'invalid _id'});
        }

        if (book === null)
        {
          return response.status(500).json({'error': 'no book exists'});
        }

        let data = {
          'title': book['title'],
          '_id': book['_id'],
          'comments': book['comments']
        };
        
        // console.log(data);
        
        return response.status(200).json(data);
      }
      catch (error)
      {
        console.error(error);
        return response
        .status(500)
        .json({
          'error': 'no book exists'
        });
      }
    })
    
    .post(async function(request, response)
    {
      //json response format same as .get
      try
      {
        // console.log(request.params);
        // console.log(request.body);

        // Find the book or abort.
        let book;
        const bookId = util.getValidField('id', request.params);

        if (util.isValidId(bookId))
        {
          book = await bookModel.findById(bookId).populate('comments');
        }
        else
        {
          return response.status(500).json({'error': 'invalid _id'});
        }

        if (book === null)
        {
          return response.status(500).json({'error': 'no book exists'});
        }

        // Get the comment text or abort if absent.
        const commentText = util.getValidField('comment', request.body);

        if (commentText === null)
        {
          return response
          .status(500)
          .json({'error': 'no comment'});
        };

        const comment = await commentModel.create({'bookId': bookId, 'comment': commentText});

        // console.log(book);

        let data = {
          'title': book['title'],
          '_id': book['_id'],
          'comments': book['comments']
        };

        // console.log(data);

        return response.status(200).json(data);
      }
      catch (error)
      {
        console.error(error);
        return response
        .status(500)
        .json({
          'error': 'no book exists'
        });
      }
    })
    
    .delete(async function(request, response)
    {
      try
      {
        const bookId = request.params.id;
        //if successful response will be 'delete successful'
        await bookModel.findAndDelete({'_id': bookId});
        // Really should delete comments with the books.
        // await commentModel.findAndDelete({'bookId': bookId});
        return response.status(200).json({'msg': 'delete successful'});
      }
      catch (error)
      {
        return response
        .status(500)
        .json({'error': 'could not delete book'})
      }
    });
};
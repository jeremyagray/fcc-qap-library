const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done)
  {
     chai.request(server)
      .get('/api/books')
      .end(function(error, response)
      {
        assert.equal(response.status, 200);
        assert.isArray(response.body, 'response should be an array');
        assert.property(response.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(response.body[0], 'title', 'Books in array should contain title');
        assert.property(response.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function()
  {
    suite('POST /api/books with title => create book object/expect book object', function()
    {
      test('Test POST /api/books with title', function(done)
      {
        chai.request(server)
          .post('/api/books')
          .send({
            'title': 'Pride and Prejudice'
          })
          .end(function(error, response)
          {
            if (error)
            {
              console.error(error);
              return done(error);
            }
            else
            {
              // console.log(response.status);
              // console.log(response.body);
              assert.equal(response.status, 200);
              assert.property(response.body, 'title');
              assert.equal(response.body.title, 'Pride and Prejudice');
              assert.property(response.body, '_id');
              assert.property(response.body, 'created_on');
              assert.property(response.body, 'updated_on');
              done();
            }
          });
      });
      
      test('Test POST /api/books with no title given', function(done)
      {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function(error, response)
          {
            if (error)
            {
              console.error(error);
              return done(error);
            }
            else
            {
              // console.log(response.status);
              // console.log(response.body);
              assert.equal(response.status, 500);
              assert.property(response.body, 'error');
              assert.equal(response.body.error, 'no title');
              done();
            }
          });
      });
    });


    suite('GET /api/books => array of books', function()
    {
      test('Test GET /api/books',  function(done)
      {
        chai.request(server)
        .get('/api/books')
        .end(function(error, response)
        {
          assert.equal(response.status, 200);
          assert.isArray(response.body, 'response should be an array');
          assert.property(response.body[0], 'commentcount', 'Books in array should contain commentcount');
          assert.property(response.body[0], 'title', 'Books in array should contain title');
          assert.property(response.body[0], '_id', 'Books in array should contain _id');
          done();
        });
      });      
    });


    suite('GET /api/books/[id] => book object with [id]', function()
    {
      
      test('Test GET /api/books/[id] with id not in db',  function(done)
      {
        chai.request(server)
        .get('/api/books/5f7fbd9c39b4ef0238ba06ec')
        .end(function(error, response)
        {
          assert.equal(response.status, 500);
          assert.property(response.body, 'error');
          assert.equal(response.body.error, 'no book exists');
          done();
        });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done)
      {
        chai.request(server)
        .get('/api/books/' + '5f7fbd9c39b4ef0238ba06ed')
        .end(function(error, response)
        {
          assert.equal(response.status, 200);
          assert.property(response.body, 'title');
          assert.property(response.body, '_id');
          assert.property(response.body, 'comments');
          assert.isArray(response.body.comments);
          done();
        });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function()
    {
      
      test('Test POST /api/books/[id] with comment', function(done)
      {
        chai.request(server)
        .post('/api/books/' + '5f7fbd9c39b4ef0238ba06ed')
        .send({
          'comment': 'This book is about vacuum cleaners.'
        })
        .end(function(error, response)
        {
          assert.equal(response.status, 200);
          assert.property(response.body, 'title');
          assert.property(response.body, '_id');
          assert.property(response.body, 'comments');
          assert.isArray(response.body.comments);
          done();
        });
      });
    });
  });
});
const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();

const {BlogPost} = require('../models');
const {app, closeServer, runServer} = require('../server');

chai.use(chaiHttp);

describe('Blog Posts', function() {

  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it('should list blog posts on GET', function() {

    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');

        res.body.length.should.be.at.least(1);
        const expectedKeys = ['id', 'title', 'content', 'author'];
        res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.include.keys(expectedKeys);
        });
      });
  });


  it('should add a blog post on POST', function() {
    const newPost = {
        title: 'This is a Test', 
        content: 'This is a test post', 
        author: 'Betty Test'
      };
    return chai.request(app)
      .post('/blog-posts')
      .send(newPost)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'title', 'content', 'author', 'publishDate');
        res.body.id.should.not.be.null;
      });
  });

  it('should update a blog post on PUT', function() {
    
    const updateData = {
      title: 'This is an update',
      content: 'This is updated content'
    };
    return BlogPost
      .findOne()
      .exec()
      .then(post => {
        updateData.id = post.id;
  
        return chai.request(app)
          .put(`/blog-posts/${updateData.id}`)
          .send(updateData);
      })
    .then(function(res) {
      res.should.have.status(200);
      res.should.be.json;
      res.body.title.should.equal(updateData.title);
      res.body.content.should.equal(updateData.content);
    })
  });


});
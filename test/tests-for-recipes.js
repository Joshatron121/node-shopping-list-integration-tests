const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp)

describe('Recipes', function(){
	before(function(){
		return runServer();
	});

	after(function(){
		return closeServer();
	});

	it('Should return recipes on GET', function(){
		return chai.request(app)
			.get('/recipes')
			.then(function(res){
				res.should.have.status(200);
				res.should.be.json;
				res.body.should.be.an.Array;
				res.body.length.should.be.at.least(1);

				const expectedKeys = ['name', 'ingredients', 'id']
				res.body.forEach(function(item){
					item.should.be.a('object');
					item.should.include.keys(expectedKeys);
				})
			})
	})

	it('Should add an item on POST', function() {
		const newItem = {
			name: 'New Test Item 1',
			ingredients: ['Ing 1', 'Ing 2', 'Ing 3']
		}
		return chai.request(app)
			.post('/recipes')
			.send(newItem)
			.then(function(res){
				res.should.have.status(201);
				res.should.be.json;
				res.body.should.be.a('object');
				res.body.should.include.keys(
					'name', 'ingredients', 'id');
				res.body.id.should.not.be.null;
				res.body.should.deep.equal(Object.assign(newItem, {id: res.body.id}));
			})
	})

	it('Should update an item on PUT', function(){
		const updatedItem = {
			name: 'Updated Item 1',
			ingredients: ['Up Ing 1', 'Up Ing 2', 'Up Ing 3']
		}
		return chai.request(app)
			.get('/recipes')
			.then(function(res){
				updatedItem.id = res.body[0].id;

				return chai.request(app)
					.put(`/recipes/${updatedItem.id}`)
					.send(updatedItem)
			})
			.then(function(res){
				res.should.have.status(200);
				res.should.be.json;
				res.body.should.be.a('object');
				res.body.should.deep.equal(updatedItem)
			})
	})

	it('Should delete an item on DELETE',function(){
		return chai.request(app)
			.get('/recipes')
			.then(function(res){
				return chai.request(app)
					.delete(`/recipes/${res.body[0].id}`)
			})
			.then(function(res){
				res.should.have.status(204)
			})
	})
})
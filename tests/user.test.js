const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, populateDatabase } = require('./fixtures/db')

beforeEach(populateDatabase)

test('Should sign up a new user', async() => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Amgad',
            email: 'amgad@example.com',
            password: 'thisismypass!'
        })
        .expect(201)

    //Assert that the user was saved to the database
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Amgad',
            email: 'amgad@example.com'
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toEqual('thisismypass')

})

test('Should login existing user', async() => {
    const response = await request(app)
        .post('/users/login')
        .send(userOne)
        .expect(200)

    const user = await User.findById(userOneId)
    expect(response.body.token).toEqual(user.tokens[1].token)
})

test('Should not login non exsistent user', async() => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'amgad@example.com',
            password: 'adummypass'
        })
        .expect(400)
})

test('Should get profile for authenticated user', async() => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async() => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for authenticated user', async() => {
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async() => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async() => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async() => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Mike'
        })
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Mike')
})

test('Should not update invalid user fields', async() => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Boston'
        })
        .expect(400)
})
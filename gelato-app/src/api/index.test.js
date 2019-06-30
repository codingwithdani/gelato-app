const { default: restApi } = require('.')
const { User, Order, mongoose } = require('gelato-data')
const { env: { MONGO_URL_TEST } } = process
const faker = require('faker')

describe('rest api', () => {
  let name, surname, email, password, name1, surname1, email1, password1

  beforeAll(() => mongoose.connect(MONGO_URL_TEST, { useNewUrlParser: true }))

  beforeEach(async () => {
    await User.deleteMany()
    await Order.deleteMany()

    name = faker.name.firstName()
    surname = faker.name.lastName()
    email = faker.internet.email()
    password = faker.internet.password()
    name1 = faker.name.firstName()
    surname1 = faker.name.lastName()
    email1 = faker.internet.email()
    password1 = faker.internet.password()
  })

  describe('register user', () => {
    it('should succeed on correct data', async () => {
      const res = await restApi.registerUser(name, surname, email, password)

      const user = await User.findOne({ email })

      expect(res.message).toBe('User registered.')
      expect(user.name).toBe(name)
      expect(user.surname).toBe(surname)
      expect(user.email).toBe(email)
      expect(user.password).toBeDefined()
    })

    it('should fail on empty name', async () => {
      const name = ' \t    \n'
      try {
        await restApi.registerUser(name, surname, email, password)
      } catch (error) {
        expect(error.message).toBe('name is empty')
      }
    })

    it('should fail on undefined name', async () => {
      const name = undefined
      try {
        await restApi.registerUser(name, surname, email, password)
      } catch (error) {
        expect(error.message).toBe('name is not optional')
      }
    })
    it('should fail on undefined surname', async () => {
      const surname = undefined
      try {
        await restApi.registerUser(name, surname, email, password)
      } catch (error) {
        expect(error.message).toBe('surname is not optional')
      }
    })
    it('should fail on empty surname', async () => {
      const surname = ' \t    \n'
      try {
        await restApi.registerUser(name, surname, email, password)
      } catch (error) {
        expect(error.message).toBe('surname is empty')
      }
    })

    it('should fail on empty email', async () => {
      const email = ' \t    \n'
      try {
        await restApi.registerUser(name, surname, email, password)
      } catch (error) {
        expect(error.message).toBe('email is empty')
      }
    })

    it('should fail on undefined email', async () => {
      const email = undefined
      try {
        await restApi.registerUser(name, surname, email, password)
      } catch (error) {
        expect(error.message).toBe('email is not optional')
      }
    })
    it('missing character on email', async () => {
      const email = 'a.com'
      try {
        await restApi.registerUser(name, surname, email, password)
      } catch (error) {
        expect(error.message).toBe(`${email} is not an e-mail`)
      }
    })

    it('should fail on empty password', async () => {
      const password = ' \t    \n'
      try {
        await restApi.registerUser(name, surname, email, password)
      } catch (error) {
        expect(error.message).toBe('password is empty')
      }
    })

    it('should fail on undefined password', async () => {
      const password = undefined
      try {
        await restApi.registerUser(name, surname, email, password)
      } catch (error) {
        expect(error.message).toBe('password is not optional')
      }
    })
  })

  describe('authenticate user', () => {
    beforeEach(() =>
      restApi.registerUser(name, surname, email, password)
    )

    it('should succeed on correct user credential', async () => {
      const response = await restApi.authenticateUser(email, password)
      expect(response).toBeDefined()
      const { token } = response
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should fail on incorrect email', async () => {
      try {
        await restApi.authenticateUser(email1, password)
      } catch (error) {
        expect(error.message).toBe('wrong credentials')
      }
    })

    it('should fail using an object as email', async () => {
      let email2 = []
      try {
        await restApi.authenticateUser(email2, password)
      } catch (error) {
        expect(error.message).toBe('email  is not a string')
      }
    })

    it('should fail using an object as email', async () => {
      let email3 = '234'
      try {
        await restApi.authenticateUser(email3, password)
      } catch (error) {
        expect(error.message).toBe('wrong credentials')
      }
    })

    it('should fail using an object as email', async () => {
      let email4 = '234@gmail'
      try {
        await restApi.authenticateUser(email4, password)
      } catch (error) {
        expect(error.message).toBe('wrong credentials')
      }
    })

    it('should fail on incorrect password', async () => {
      let password2 = '782'
      try {
        await restApi.authenticateUser(email, password2)
      } catch (error) {
        expect(error.message).toBe('wrong credentials')
      }
    })

    it('should fail on undefined password', async () => {
      let password3
      try {
        await restApi.authenticateUser(email, password3)
      } catch (error) {
        expect(error.message).toBe('password is not optional')
      }
    })

    it('should fail using an object as a password', async () => {
      let password4 = []
      try {
        await restApi.authenticateUser(email, password4)
      } catch (error) {
        expect(error.message).toBe('password  is not a string')
      }
    })
  })

  describe('retrieve user', () => {
    beforeEach(async () => { await restApi.registerUser(name, surname, email, password) })

    it('should succeed retrieving an existing user with correct id', async () => {
      const _token = await restApi.authenticateUser(email, password)
      const _user = await restApi.retrieveUser(_token.token)
      expect(_user.name).toEqual(name)
      expect(_user.surname).toEqual(surname)
      expect(_user.email).toEqual(email)
      expect(_user.password).toBe(undefined)
    })

    it('should fail retrieving an existing user with in-correct id', async () => {
      const token = '64646446464644'
      try {
        await restApi.retrieveUser(token)
      } catch (error) {
        expect(error.message).toEqual('jwt malformed')
      }
    })

    it('should fail retrieving an existing user with in-correct id', async () => {
      const token2 = ' \t    \n'
      try {
        await restApi.retrieveUser(token2)
      } catch (error) {
        expect(error.message).toEqual('token is empty')
      }
    })

    it('should fail retrieving an existing user with in-correct id', async () => {
      const token3 = undefined
      try {
        await restApi.retrieveUser(token3)
      } catch (error) {
        expect(error.message).toEqual('token is not optional')
      }
    })

    it('should fail retrieving an existing user with in-correct id', async () => {
      const token4 = ''
      try {
        await restApi.retrieveUser(token4)
      } catch (error) {
        expect(error.message).toEqual('token is empty')
      }
    })
  })

  describe('add an order', () => {
    beforeEach(() => {
      return restApi.registerUser(name, surname, email, password)
    })

    it('should succeed adding an order on existing user', async () => {
      const res = await restApi.authenticateUser(email, password)
      let _token = res.token

      let type = 'cone'
      let size = 'big'
      let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
      let totalPrice = 12

      const orderResponse = await restApi.addOrder(_token, flavors, size, type, totalPrice)
      expect(orderResponse).toBeDefined()
      const orders = await Order.find()
      expect(orders).toBeDefined()
      expect(orders[0].type).toBe('cone')
      expect(orders[0].size).toBe('big')
      expect.arrayContaining(orders[0].flavors)
    })

    it('should fail adding an order with empty token', async () => {
      let client = ' \t    \n'

      let type = 'cone'
      let size = 'big'
      let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
      let totalPrice = 12

      try {
        await restApi.addOrder(client, flavors, size, type, totalPrice)
      } catch (error) {
        expect(error.message).toBe('token is empty')
      }
    })

    it('should fail adding an order with wrong token', async () => {
      let client = '234'

      let type = 'cone'
      let size = 'big'
      let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
      let totalPrice = 12

      try {
        await restApi.addOrder(client, flavors, size, type, totalPrice)
      } catch (error) {
        expect(error.message).toBe('jwt malformed')
      }
    })

    it('should fail adding an order with undefined token', async () => {
      let client

      let type = 'cone'
      let size = 'big'
      let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
      let totalPrice = 12

      try {
        await restApi.addOrder(client, flavors, size, type, totalPrice)
      } catch (error) {
        expect(error.message).toBe('token is not optional')
      }
    })

    it('should fail adding an order with wrong token format', async () => {
      let client = []

      let type = 'cone'
      let size = 'big'
      let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
      let totalPrice = 12

      try {
        await restApi.addOrder(client, flavors, size, type, totalPrice)
      } catch (error) {
        expect(error.message).toBe('token  is not a string')
      }
    })

    it('should fail adding an order with empty type', async () => {
      const res = await restApi.authenticateUser(email, password)
      let _token = res.token

      let type = ' \t    \n'
      let size = 'big'
      let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
      let totalPrice = 12

      try {
        await restApi.addOrder(_token, flavors, size, type, totalPrice)
      } catch (error) {
        expect(error.message).toBe('type is empty')
      }
    })

    it('should fail adding an order with undefined type', async () => {
      const res = await restApi.authenticateUser(email, password)
      let _token = res.token

      let type
      let size = 'big'
      let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
      let totalPrice = 12

      try {
        await restApi.addOrder(_token, flavors, size, type, totalPrice)
      } catch (error) {
        expect(error.message).toBe('type is not optional')
      }
    })

    it('should fail adding an order with empty size', async () => {
      const res = await restApi.authenticateUser(email, password)
      let _token = res.token

      let type = 'cone'
      let size = ' \t    \n'
      let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
      let totalPrice = 12

      try {
        await restApi.addOrder(_token, flavors, size, type, totalPrice)
      } catch (error) {
        expect(error.message).toBe('size is empty')
      }
    })

    it('should fail adding an order with undefined size', async () => {
      const res = await restApi.authenticateUser(email, password)
      let _token = res.token

      let type = 'cone'
      let size
      let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
      let totalPrice = 12

      try {
        await restApi.addOrder(_token, flavors, size, type, totalPrice)
      } catch (error) {
        expect(error.message).toBe('size is not optional')
      }
    })
  })

  describe('delete an user', () => {
    beforeEach(() => {
      return restApi.registerUser(name, surname, email, password)
    })

    it('should succeed eliminating an existing user', async () => {
      const res = await restApi.authenticateUser(email, password)
      let _token = res.token
      const response = await restApi.deleteUser(_token)
      expect(response.message).toBe('User deleted.')
    })

    it('should fail eliminating an existing user with undefined user', async () => {
      let _token
      try {
        await restApi.deleteUser(_token)
      } catch (error) {
        expect(error.message).toBe('token is not optional')
      }
    })

    it('should fail eliminating an existing user with empty token', async () => {
      let _token
      try {
        await restApi.deleteUser(_token)
      } catch (error) {
        expect(error.message).toBe('token is not optional')
      }
    })

    it('should fail eliminating an existing user with empty wrong token', async () => {
      let _token = '82368926321'
      try {
        await restApi.deleteUser(_token)
      } catch (error) {
        expect(error.message).toBe('jwt malformed')
      }
    })

    it('should fail eliminating an existing user with ', async () => {
      // const res = await restApi.authenticateUser(email, password)
      let _token = []
      try {
        await restApi.deleteUser(_token)
      } catch (error) {
        expect(error.message).toBe('token  is not a string')
      }
    })

    it('should fail eliminating an existing user with empty token', async () => {
      // const res = await restApi.authenticateUser(email, password)
      let _token = ''
      try {
        await restApi.deleteUser(_token)
      } catch (error) {
        expect(error.message).toBe('token is empty')
      }
    })
  })

  describe('retrieve orders by user id', () => {
    beforeEach(async () => {
      await restApi.registerUser(name, surname, email, password)
    })
    it('should succeed retrieving orders by user id', async () => {
      const _token = await restApi.authenticateUser(email, password)
      const id = _token.token
      let type = 'cone'
      let size = 'big'
      let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
      let totalPrice = 12

      await restApi.addOrder(id, flavors, size, type, totalPrice)
      await restApi.addOrder(id, flavors, size, type, totalPrice)
      const orders = await restApi.retrieveOrdersByUserId(id)
      expect(orders).toBeDefined()
      expect(orders).toHaveLength(2)
    })

    it('should fail retrieving orders by empty id', async () => {
      try {
        await restApi.authenticateUser(email, password)
        const id = ''
        let type = 'cone'
        let size = 'big'
        let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
        let totalPrice = 12
        await restApi.addOrder(id, flavors, size, type, totalPrice)
        await restApi.addOrder(id, flavors, size, type, totalPrice)
        const orders = await restApi.retrieveOrdersByUserId(id)
        expect(orders).toBeDefined()
        expect(orders).toHaveLength(2)
      } catch (error) {
        expect(error.message).toBe('token is empty')
      }
    })

    it('should fail retrieving orders by undefined id', async () => {
      try {
        await restApi.authenticateUser(email, password)
        const id = undefined
        let type = 'cone'
        let size = 'big'
        let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
        let totalPrice = 12

        await restApi.addOrder(id, flavors, size, type, totalPrice)
        await restApi.addOrder(id, flavors, size, type, totalPrice)
        const orders = await restApi.retrieveOrdersByUserId(id)
        expect(orders).toBeDefined()
        expect(orders).toHaveLength(2)
      } catch (error) {
        expect(error.message).toBe('token is not optional')
      }
    })

    it('should fail retrieving orders by object id', async () => {
      try {
        await restApi.authenticateUser(email, password)
        const id = []
        let type = 'cone'
        let size = 'big'
        let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
        let totalPrice = 12

        await restApi.addOrder(id, flavors, size, type, totalPrice)
        await restApi.addOrder(id, flavors, size, type, totalPrice)
        const orders = await restApi.retrieveOrdersByUserId(id)
        expect(orders).toBeDefined()
        expect(orders).toHaveLength(2)
      } catch (error) {
        expect(error.message).toBe('token  is not a string')
      }
    })
  })

  describe('retrieve One Order by user and order id', () => {
    beforeEach(() => {
      return restApi.registerUser(name, surname, email, password)
    })
    it('should succeed retrieving one order', async () => {
      const _token = await restApi.authenticateUser(email, password)
      const userToken = _token.token
      let type = 'cone'
      let size = 'big'
      let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
      let totalPrice = 12

      await restApi.addOrder(_token.token, flavors, size, type, totalPrice)
      const allorders = await restApi.retrieveOrdersByUserId(userToken)
      const orderId = allorders[0].id
      const retrievedOrderByUserAndOrderId = await restApi.retrieveOneOrder(orderId)
      expect(retrievedOrderByUserAndOrderId).toHaveLength(1)
    })

    it('should fail retrieving one order by sending and object as orderId', async () => {
      try {
        const _token = await restApi.authenticateUser(email, password)
        const userToken = _token.token
        let type = 'cone'
        let size = 'big'
        let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
        let totalPrice = 12
        await restApi.addOrder(_token.token, flavors, size, type, totalPrice)
        const orderId = []
        await restApi.retrieveOneOrder(orderId)
      } catch (error) {
        expect(error.message).toBe('id  is not a string')
      }
    })

    it('should fail retrieving one order by sending an empty orderId', async () => {
      try {
        const _token = await restApi.authenticateUser(email, password)
        const userToken = _token.token
        let type = 'cone'
        let size = 'big'
        let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
        let totalPrice = 12
        await restApi.addOrder(_token.token, flavors, size, type, totalPrice)
        const orderId = '\t    \n'
        await restApi.retrieveOneOrder(orderId)
      } catch (error) {
        expect(error.message).toBe('id is empty')
      }
    })

    it('should fail retrieving one order by sending a undefined orderId', async () => {
      try {
        const _token = await restApi.authenticateUser(email, password)
        const userToken = _token.token
        let type = 'cone'
        let size = 'big'
        let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
        let totalPrice = 12
        await restApi.addOrder(userToken, flavors, size, type, totalPrice)
        const orderId = undefined
        await restApi.retrieveOneOrder(orderId)
      } catch (error) {
        expect(error.message).toBe('id is not optional')
      }
    })
  })

  describe('delete one order', () => {
    beforeEach(() => {
      return restApi.registerUser(name, surname, email, password)
    })

    it('should succeed removing an existing order', async () => {
      const _token = await restApi.authenticateUser(email, password)
      const userToken = _token.token

      let type = 'cone'
      let type2 = 'tarrina'
      let size = 'big'
      let size2 = 'small'
      let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
      let flavors2 = ['lemon', 'strawberry', 'cheesecake']
      let totalPrice = 12
      await restApi.addOrder(userToken, flavors2, size2, type2, totalPrice)
      await restApi.addOrder(userToken, flavors, size, type, totalPrice)
      const allorders = await restApi.retrieveOrdersByUserId(userToken)
      const orderId = allorders[0].id
      await restApi.removeOneOrder(userToken, orderId)

      const updatedOrders = await restApi.retrieveOrdersByUserId(userToken)
      expect(updatedOrders).toHaveLength(1)
      expect(updatedOrders[0].size).toBe(size2)
      expect(updatedOrders[0].type).toBe(type2)
    })

    it('should fail removing an order by sending undefined orderId', async () => {
      try {
        const _token = await restApi.authenticateUser(email, password)
        const userToken = _token.token
        let type = 'cone'
        let type2 = 'tarrina'
        let size = 'big'
        let size2 = 'small'
        let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
        let flavors2 = ['lemon', 'strawberry', 'cheesecake']
        let totalPrice = 12
        let totalPrice2 = 4
        await restApi.addOrder(userToken, flavors2, size2, type2, totalPrice)
        await restApi.addOrder(userToken, flavors, size, type, totalPrice2)
        const orderId = undefined
        await restApi.removeOneOrder(userToken, orderId)
      } catch (error) {
        expect(error.message).toBe('id is not optional')
      }
    })

    it('should fail removing an order by sending empty orderId', async () => {
      try {
        const _token = await restApi.authenticateUser(email, password)
        const userToken = _token.token
        let type = 'cone'
        let type2 = 'tarrina'
        let size = 'big'
        let size2 = 'small'
        let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
        let flavors2 = ['lemon', 'strawberry', 'cheesecake']
        let totalPrice = 12
        await restApi.addOrder(userToken, flavors2, size2, type2, totalPrice)
        await restApi.addOrder(userToken, flavors, size, type, totalPrice)
        const orderId = ''
        await restApi.removeOneOrder(userToken, orderId)
      } catch (error) {
        expect(error.message).toBe('id is empty')
      }
    })

    it('should fail removing an order by sending an object as orderId', async () => {
      try {
        const _token = await restApi.authenticateUser(email, password)
        const userToken = _token.token
        let type = 'cone'
        let type2 = 'tarrina'
        let size = 'big'
        let size2 = 'small'
        let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
        let flavors2 = ['lemon', 'strawberry', 'cheesecake']
        let totalPrice = 12
        await restApi.addOrder(userToken, flavors2, size2, type2, totalPrice)
        await restApi.addOrder(userToken, flavors, size, type, totalPrice)
        const orderId = []
        await restApi.removeOneOrder(userToken, orderId)
      } catch (error) {
        expect(error.message).toBe('id  is not a string')
      }
    })

    it('should fail removing an order by sending an undefined token', async () => {
      try {
        await restApi.authenticateUser(email, password)
        const userToken = undefined

        let type = 'cone'
        let type2 = 'tarrina'
        let size = 'big'
        let size2 = 'small'
        let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
        let flavors2 = ['lemon', 'strawberry', 'cheesecake']
        let totalPrice = 12
        await restApi.addOrder(userToken, flavors2, size2, type2, totalPrice)
        await restApi.addOrder(userToken, flavors, size, type, totalPrice)
        const allorders = await restApi.retrieveOrdersByUserId(userToken)
        const orderId = allorders[0].id
        await restApi.removeOneOrder(userToken, orderId)
      } catch (error) {
        expect(error.message).toBe('token is not optional')
      }
    })

    it('should fail removing an order by sending empty token', async () => {
      try {
        await restApi.authenticateUser(email, password)
        const userToken = ''

        let type = 'cone'
        let type2 = 'tarrina'
        let size = 'big'
        let size2 = 'small'
        let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
        let flavors2 = ['lemon', 'strawberry', 'cheesecake']
        let totalPrice = 12
        await restApi.addOrder(userToken, flavors2, size2, type2, totalPrice)
        await restApi.addOrder(userToken, flavors, size, type, totalPrice)
        const allorders = await restApi.retrieveOrdersByUserId(userToken)
        const orderId = allorders[0].id
        await restApi.removeOneOrder(userToken, orderId)
      } catch (error) {
        expect(error.message).toBe('token is empty')
      }
    })

    it('should fail removing an order by sending wrong token', async () => {
      try {
        await restApi.authenticateUser(email, password)
        const userToken = '23927932'

        let type = 'cone'
        let type2 = 'tarrina'
        let size = 'big'
        let size2 = 'small'
        let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
        let flavors2 = ['lemon', 'strawberry', 'cheesecake']
        let totalPrice = 12
        await restApi.addOrder(userToken, flavors2, size2, type2, totalPrice)
        await restApi.addOrder(userToken, flavors, size, type, totalPrice)
        const allorders = await restApi.retrieveOrdersByUserId(userToken)
        const orderId = allorders[0].id
        await restApi.removeOneOrder(userToken, orderId)
      } catch (error) {
        expect(error.message).toBe('jwt malformed')
      }
    })

    it('should fail removing an order by sending an object as token', async () => {
      try {
        await restApi.authenticateUser(email, password)
        const userToken = []

        let type = 'cone'
        let type2 = 'tarrina'
        let size = 'big'
        let size2 = 'small'
        let flavors = ['vanilla', 'chocolate', 'blackberry rosé']
        let flavors2 = ['lemon', 'strawberry', 'cheesecake']
        let totalPrice = 12
        await restApi.addOrder(userToken, flavors2, size2, type2, totalPrice)
        await restApi.addOrder(userToken, flavors, size, type, totalPrice)
        const allorders = await restApi.retrieveOrdersByUserId(userToken)
        const orderId = allorders[0].id
        await restApi.removeOneOrder(userToken, orderId)
      } catch (error) {
        expect(error.message).toBe('token  is not a string')
      }
    })
  })

  describe('retrieve all users orders', () => {
    let type, type2, size, size2, flavors, flavors2, totalPrice, totalPrice2, userToken, userToken1

    beforeEach(async () => {
      type = faker.commerce.product()
      type2 = faker.commerce.product()
      size = faker.commerce.productAdjective()
      size2 = faker.commerce.productAdjective()
      flavors = ['vanilla', 'chocolate', 'blackberry rosé']
      flavors2 = ['lemon', 'strawberry', 'cheesecake']
      totalPrice = 12
      totalPrice2 = 16
      await restApi.registerUser(name, surname, email, password)
      await restApi.registerUser(name1, surname1, email1, password1)
      const _token = await restApi.authenticateUser(email, password)
      const _token1 = await restApi.authenticateUser(email1, password1)
      userToken = _token.token
      userToken1 = _token1.token
      await restApi.addOrder(userToken, flavors2, size2, type2, totalPrice)
      await restApi.addOrder(userToken1, flavors, size, type, totalPrice2)
    })
    it('should succeed retrieving all users orders', async () => {
      const data = { superUser: 'true', name: 'daniela' }
      const user = await User.findOne({ email })
      const id = user.id
      await User.findByIdAndUpdate(id, data)
      const _token2 = await restApi.authenticateUser(email, password)
      const orders = await restApi.retrieveAllUsersOrders(_token2.token)
      expect(orders).toBeDefined()
    })

    it('should fail retrieving all users orders', async () => {
      try {
        await restApi.retrieveAllUsersOrders(userToken1)
      } catch (error) {
        expect(error.message).toBe('You do not have permission to do this')
      }
    })
  })

  describe('update user', () => {
    const data = { name: 'Test', surname: 'Aguilera' }
    let token

    beforeEach(async () => {
      email = `daniela-${Math.random()}@gmail.com`
      password = `Pass-${Math.random()}`

      await restApi.registerUser(name, surname, email, password)
      token = await restApi.authenticateUser(email, password)
    })

    it('should succeed on correct credentials', async () => {
      await restApi.updateUser(token.token, data)
      const user = await User.findOne({ email })
      expect(user.name).toBe(data.name)
      expect(user.surname).toBe(data.surname)
    })

    it('should fail on empty data', () =>
      expect(() => restApi.updateUser(token.token)).toThrowError('data is not optional'))

    it('should fail when data is a number', () =>
      expect(() => restApi.updateUser(token.token, 1)).toThrowError('data 1 is not a object'))

    it('should fail when data is an object', () =>
      expect(() => restApi.updateUser(token.token, 'hola')).toThrowError('data hola is not a object'))

    it('should fail when data is a boolean', () =>
      expect(() => restApi.updateUser(token.token, true)).toThrowError('data true is not a object'))

    it('should fail when token is a string', () =>
      expect(() => restApi.updateUser([], data)).toThrowError('token  is not a string'))

    it('should fail when token is a number', () =>
      expect(() => restApi.updateUser(1, data)).toThrowError('token 1 is not a string'))

    it('should fail when token is a bolean', () =>
      expect(() => restApi.updateUser(true, data)).toThrowError('token true is not a string'))
  })

  afterAll(() => mongoose.disconnect())
})

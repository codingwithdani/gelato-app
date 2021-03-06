const { Schema } = require('mongoose')
const Order = require('./order')

const User = new Schema({
  name: {
    type: String,
    required: true
  },

  surname: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: email => {
        return /^\w+([.-]?\w+)+@\w+([.:]?\w+)+(\.[a-zA-Z0-9]{2,3})+$/.test(email)
      },
      message: props => `${props.value} is not a valid email`
    }
  },

  password: {
    type: String,
    required: true
  },

  superUser: {
    type: Boolean,
    default: false
  },
  orders: [Order]
})

module.exports = User

const ChatRoleEnum = Object.freeze({
  USER: 'user',
  MODEL: 'model',

  isValid(role) {
    return role === this.USER || role === this.MODEL;
  },
});

module.exports = { ChatRoleEnum };

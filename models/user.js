'use strict';


const useBcrypt = require('sequelize-bcrypt');


module.exports = (sequelize, dataTypes) => {
  const thisModel = sequelize.define("user", {
    account: {
      type: dataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: '帳號'
    },
    password: {
      type: dataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: '加密後密碼'
    }
  })

  useBcrypt(thisModel);
  return thisModel
}

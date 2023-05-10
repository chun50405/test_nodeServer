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
      unique: false,
      comment: '加密後密碼'
    },
    email: {
      type: dataTypes.STRING,
      allowNull: false,
      unique: false,
      comment: '電子郵件'
    },
    isVerified: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "是否經過驗證"
    }
  })

  useBcrypt(thisModel);
  return thisModel
}

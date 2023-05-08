const config_env = require("../config_env");


module.exports =
{
  "development": {
    "username": config_env.DB_USERNAME,
    "password": config_env.DB_PASSWORD,
    "database": config_env.DB_DBNAME,
    "host": config_env.DB_HOST,
    "dialect": "mysql",
    "logging": false
  },
  "test": {
    "username": config_env.DB_USERNAME,
    "password": config_env.DB_PASSWORD,
    "database": config_env.DB_DBNAME,
    "host": config_env.DB_HOST,
    "dialect": "mysql",
    "logging": false
  },
  "production": {
    "username": config_env.DB_USERNAME,
    "password": config_env.DB_PASSWORD,
    "database": config_env.DB_DBNAME,
    "host": config_env.DB_HOST,
    "dialect": "mysql",
    "logging": false
  }
}

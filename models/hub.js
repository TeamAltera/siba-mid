'use strict';
module.exports = (sequelize, DataTypes) => {
  const hub = sequelize.define('hub', {
    owner_id: DataTypes.INTEGER
  }, {});
  hub.associate = function(models) {
    // associations can be defined here
  };
  return hub;
};
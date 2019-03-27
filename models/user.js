/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define('user', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    role_type: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    MAC: {
      type: DataTypes.CHAR(17),
      allowNull: false,
      references: {
        model: 'hub',
        key: 'MAC'
      }
    }
  }, {
    tableName: 'user'
  });

  user.associate = (models) => {
    user.belongsTo(models.hub, {
      foreignKey: 'MAC'
    })
  }

  return user;
};

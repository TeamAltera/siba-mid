/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var dev = sequelize.define('dev', {
    dev_MAC: {
      type: DataTypes.CHAR(17),
      allowNull: false,
      primaryKey: true
    },
    cur_ip: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    dev_type: {
      type: DataTypes.STRING(30),
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
    tableName: 'dev'
  });

  dev.associate = (models) =>{
    dev.belongsTo(models.hub, {
      foreignKey: 'MAC'
    })
  }

  return dev;
};

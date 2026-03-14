const STATUS_KEY_VALUES = ["SYSTEM_POWER", "H2_BYPASS", "SERVICE_MODE"];

export { STATUS_KEY_VALUES };

export default function machineStatusModel(sequelize, DataTypes) {
  return sequelize.define(
    "machine_status",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      key: {
        type: DataTypes.ENUM(...STATUS_KEY_VALUES),
        allowNull: false,
        unique: true,
      },
      value: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isIn: [[0, 1]],
        },
      },
    },
    {
      tableName: "machine_statuses",
      underscored: true,
      timestamps: true,
      createdAt: false,
      updatedAt: "updated_at",
    },
  );
}

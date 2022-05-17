'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return queryInterface.createTable('users', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			email: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},
			username: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			password: {
				type: Sequelize.STRING,
				allowNull: false,
			},
		});
	},

	async down(queryInterface, Sequelize) {
		return queryInterface.dropTable('users');
	},
};

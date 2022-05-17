'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return queryInterface.createTable('games', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			userCount: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
				allowNull: false,
			},
		});
	},

	async down(queryInterface, Sequelize) {
		return queryInterface.dropTable('games');
	},
};

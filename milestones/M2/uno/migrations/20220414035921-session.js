'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return queryInterface.createTable('session', {
			sid: {
				type: Sequelize.STRING,
				primaryKey: true,
				allowNull: false,
			},
			sess: {
				type: Sequelize.JSON,
				allowNull: false,
			},
			expire: {
				type: 'TIMESTAMP',
				allowNull: false,
			},
		});
	},

	async down(queryInterface, Sequelize) {
		return queryInterface.dropTable('session');
	},
};

'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return queryInterface.addColumn('games', 'active', {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
		});
	},

	async down(queryInterface, Sequelize) {
		return queryInterface.removeColumn('games', 'active');
	},
};

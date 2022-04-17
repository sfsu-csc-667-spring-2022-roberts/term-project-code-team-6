'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('cards', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			color: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			value: {
				type: Sequelize.STRING,
				allowNull: false,
			},
		});
		return queryInterface.bulkInsert('cards', [
			{ color: 'red', value: '0' },
			{ color: 'red', value: '1' },
			{ color: 'red', value: '1' },
			{ color: 'red', value: '2' },
			{ color: 'red', value: '2' },
			{ color: 'red', value: '3' },
			{ color: 'red', value: '3' },
			{ color: 'red', value: '4' },
			{ color: 'red', value: '4' },
			{ color: 'red', value: '5' },
			{ color: 'red', value: '5' },
			{ color: 'red', value: '6' },
			{ color: 'red', value: '6' },
			{ color: 'red', value: '7' },
			{ color: 'red', value: '7' },
			{ color: 'red', value: '8' },
			{ color: 'red', value: '8' },
			{ color: 'red', value: '9' },
			{ color: 'red', value: '9' },
			{ color: 'yellow', value: '0' },
			{ color: 'yellow', value: '1' },
			{ color: 'yellow', value: '1' },
			{ color: 'yellow', value: '2' },
			{ color: 'yellow', value: '2' },
			{ color: 'yellow', value: '3' },
			{ color: 'yellow', value: '3' },
			{ color: 'yellow', value: '4' },
			{ color: 'yellow', value: '4' },
			{ color: 'yellow', value: '5' },
			{ color: 'yellow', value: '5' },
			{ color: 'yellow', value: '6' },
			{ color: 'yellow', value: '6' },
			{ color: 'yellow', value: '7' },
			{ color: 'yellow', value: '7' },
			{ color: 'yellow', value: '8' },
			{ color: 'yellow', value: '8' },
			{ color: 'yellow', value: '9' },
			{ color: 'yellow', value: '9' },
			{ color: 'blue', value: '0' },
			{ color: 'blue', value: '1' },
			{ color: 'blue', value: '1' },
			{ color: 'blue', value: '2' },
			{ color: 'blue', value: '2' },
			{ color: 'blue', value: '3' },
			{ color: 'blue', value: '3' },
			{ color: 'blue', value: '4' },
			{ color: 'blue', value: '4' },
			{ color: 'blue', value: '5' },
			{ color: 'blue', value: '5' },
			{ color: 'blue', value: '6' },
			{ color: 'blue', value: '6' },
			{ color: 'blue', value: '7' },
			{ color: 'blue', value: '7' },
			{ color: 'blue', value: '8' },
			{ color: 'blue', value: '8' },
			{ color: 'blue', value: '9' },
			{ color: 'blue', value: '9' },
			{ color: 'green', value: '0' },
			{ color: 'green', value: '1' },
			{ color: 'green', value: '1' },
			{ color: 'green', value: '2' },
			{ color: 'green', value: '2' },
			{ color: 'green', value: '3' },
			{ color: 'green', value: '3' },
			{ color: 'green', value: '4' },
			{ color: 'green', value: '4' },
			{ color: 'green', value: '5' },
			{ color: 'green', value: '5' },
			{ color: 'green', value: '6' },
			{ color: 'green', value: '6' },
			{ color: 'green', value: '7' },
			{ color: 'green', value: '7' },
			{ color: 'green', value: '8' },
			{ color: 'green', value: '8' },
			{ color: 'green', value: '9' },
			{ color: 'green', value: '9' },
			{ color: 'red', value: 'draw2' },
			{ color: 'red', value: 'draw2' },
			{ color: 'yellow', value: 'draw2' },
			{ color: 'yellow', value: 'draw2' },
			{ color: 'blue', value: 'draw2' },
			{ color: 'blue', value: 'draw2' },
			{ color: 'green', value: 'draw2' },
			{ color: 'green', value: 'draw2' },
			{ color: 'red', value: 'reverse' },
			{ color: 'red', value: 'reverse' },
			{ color: 'yellow', value: 'reverse' },
			{ color: 'yellow', value: 'reverse' },
			{ color: 'blue', value: 'reverse' },
			{ color: 'blue', value: 'reverse' },
			{ color: 'green', value: 'reverse' },
			{ color: 'green', value: 'reverse' },
			{ color: 'red', value: 'skip' },
			{ color: 'red', value: 'skip' },
			{ color: 'yellow', value: 'skip' },
			{ color: 'yellow', value: 'skip' },
			{ color: 'blue', value: 'skip' },
			{ color: 'blue', value: 'skip' },
			{ color: 'green', value: 'skip' },
			{ color: 'green', value: 'skip' },
			{ color: 'wild', value: 'wild' },
			{ color: 'wild', value: 'wild' },
			{ color: 'wild', value: 'wild' },
			{ color: 'wild', value: 'wild' },
			{ color: 'wild', value: 'draw4' },
			{ color: 'wild', value: 'draw4' },
			{ color: 'wild', value: 'draw4' },
			{ color: 'wild', value: 'draw4' },
		]);
	},

	async down(queryInterface, Sequelize) {
		return queryInterface.dropTable('cards');
	},
};

import { Table, Model, PrimaryKey, Column, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Player } from './Player';

@Table
export class UTRProfile extends Model<UTRProfile> {
	@PrimaryKey
	@Column
	id: number; // Don't auto increment, these will come directly from UTR

	@Column
	singlesRating: number;

	@ForeignKey(() => Player)
	@Column
	playerId: number;

	@BelongsTo(() => Player)
	player: Player;
}

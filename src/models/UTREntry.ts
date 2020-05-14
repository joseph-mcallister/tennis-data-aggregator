import {
	Table,
	Model,
	PrimaryKey,
	Column,
	BelongsTo,
	ForeignKey,
	AutoIncrement,
	CreatedAt
} from 'sequelize-typescript';
import { Player } from './Player';

@Table
export class UTREntry extends Model<UTREntry> {
	@PrimaryKey
	@AutoIncrement
	@Column
	id: number;

	@Column
	utrId: number;

	@CreatedAt
	createdAt: Date;

	@Column
	singlesRating: number;

	@ForeignKey(() => Player)
	@Column
	playerId: number;

	@BelongsTo(() => Player)
	player: Player;
}

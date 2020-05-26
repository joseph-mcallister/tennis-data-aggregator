import {
	Table,
	Model,
	PrimaryKey,
	Column,
	BelongsTo,
	ForeignKey,
	AutoIncrement,
	CreatedAt,
	DataType
} from 'sequelize-typescript';
import { Player } from './Player';

@Table
export class UTREntry extends Model<UTREntry> {
	@PrimaryKey
	@AutoIncrement
	@Column
	id: number;

	@Column
	utrProfileId: number;

	@CreatedAt
	createdAt: Date;

	@Column(DataType.DOUBLE)
	singlesRating: number;

	@Column(DataType.DOUBLE)
	doublesRating: number;

	@ForeignKey(() => Player)
	@Column
	playerId: number;

	@BelongsTo(() => Player)
	player: Player;
}

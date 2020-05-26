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
export class ITFEntry extends Model<ITFEntry> {
	@PrimaryKey
	@AutoIncrement
	@Column
	id: number;

	@Column
	itfId: number;

	@CreatedAt
	createdAt: Date;

	@ForeignKey(() => Player)
	@Column
	playerId: number;

	@BelongsTo(() => Player)
	player: Player;
}

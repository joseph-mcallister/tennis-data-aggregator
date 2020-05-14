import { AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { UTREntry } from './UTREntry';

@Table
export class Player extends Model<Player> {
	@PrimaryKey
	@AutoIncrement
	@Column
	id: number;

	@Column
	name: string;

	@Unique
	@Column(DataType.INTEGER) // null messes with the type inference
	utrProfileId: number | null;

	@HasMany(() => UTREntry)
	utrEntries: UTREntry[];
}

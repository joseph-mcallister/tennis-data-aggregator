import {
	AutoIncrement,
	Column,
	DataType,
	HasMany,
	Model,
	PrimaryKey,
	Table,
	Unique
} from 'sequelize-typescript';
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

	@Unique
	@Column(DataType.INTEGER) // null messes with the type inference
	itfProfileId: number | null;

	@Unique
	@Column(DataType.INTEGER) // null messes with the type inference
	trProfileId: number | null;

	@HasMany(() => UTREntry)
	utrEntries: UTREntry[];

	@Column
	gradClassName: string;

	@Column
	gradYear: Date;

	@Column
	birthday: Date;

	@Column
	location: string;

	@Column(DataType.DOUBLE)
	latitude: number;

	@Column(DataType.DOUBLE)
	longitude: number;
}

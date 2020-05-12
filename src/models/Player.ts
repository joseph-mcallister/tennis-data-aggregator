import { AutoIncrement, Column, DataType, ForeignKey, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { UTRProfile } from './UTRProfile';

@Table
export class Player extends Model<Player> {
	@PrimaryKey
	@AutoIncrement
	@Column
	id: number;

	@Column
	name: string;

	@ForeignKey(() => UTRProfile)
	@Column(DataType.INTEGER) // null messes with the type inference
	utrProfileId: number | null;

	@HasOne(() => UTRProfile)
	utrProfile: UTRProfile | null;
}

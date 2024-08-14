import { Entity, Column, PrimaryColumn, Index, CreateDateColumn, UpdateDateColumn } from "typeorm"
import type { Point } from "typeorm"


@Entity({ name: 'sockets', /* synchronize: false */ })
export class SocketEntity {
    @PrimaryColumn({ type: 'char', length: 20, nullable: false })
    socket_id: string

    @Index("COORDS_IDX", { spatial: true })
    @Column({ type: 'geometry', srid: 4326, nullable: false })
    coords: Point

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}

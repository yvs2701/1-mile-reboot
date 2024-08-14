import { DataSource, Repository, NotBrackets } from "typeorm"
import { SocketEntity } from "./DBModels.js"
import { Socket } from "socket.io"

export class SocketController {
    dataSource: DataSource
    socketRepo: Repository<SocketEntity>
    RANGE_LOWER_BOUND_DEFAULT: number
    RANGE_UPPER_BOUND_DEFAULT: number

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource
        this.socketRepo = this.dataSource.getRepository(SocketEntity)
        this.RANGE_LOWER_BOUND_DEFAULT = 1609.34 // 1.6km
        this.RANGE_UPPER_BOUND_DEFAULT = 8046.72 // 8km
    }

    getSocketEntity(socket: Socket) {
        if (socket.data === undefined || socket.data.coords?.latitude === undefined || socket.data.coords?.longitude === undefined) {
            throw new Error('Socket coordinates are not set. Cannot create SocketEntity.')
        }
        const socketEntity = new SocketEntity()
        socketEntity.socket_id = socket.id
        socketEntity.coords = { type: 'Point', coordinates: [socket.data.coords.longitude, socket.data.coords.latitude] }
        return socketEntity
    }

    async doesSocketExist(socket_id: string) {
        return await this.socketRepo.exists({ where: { socket_id } })
    }

    async getSocketById(socket_id: string) {
        return await this.socketRepo.findOne({ select: ['socket_id', 'coords', 'created_at', 'updated_at'], where: { socket_id } })
    }

    async createSocket(socket_id: string, coords: { latitude: number, longitude: number }) {
        const socket = new SocketEntity()
        socket.socket_id = socket_id
        socket.coords = { type: 'Point', coordinates: [coords.longitude, coords.latitude] }
        try {
            const res = await this.socketRepo.save(socket)
            return res
        } catch (err) {
            console.error('Failed to insert:', socket, 'Error:', err)
            return null
        }
    }

    async createSocketFromEntity(socket: SocketEntity) {
        const alreadyExists = await this.doesSocketExist(socket.socket_id)
        if (alreadyExists) {
            throw new Error('Socket already exists. Socket creation failed.')
        }
        return await this.socketRepo.save(socket)
    }

    async updateSocket(socket: SocketEntity) {
        const alreadyExists = await this.doesSocketExist(socket.socket_id)
        if (!alreadyExists) {
            throw new Error('Socket does not exist. Socket update failed.')
        }
        return await this.socketRepo.save(socket)
    }

    async deleteSocket(socket: SocketEntity) {
        return await this.socketRepo.remove(socket)
    }

    async deleteSocketById(socket_id: string) {
        return await this.socketRepo.delete({ socket_id })
    }

    async findPeerWithingRange(socket: SocketEntity, lower_bound = this.RANGE_LOWER_BOUND_DEFAULT, upper_bound = this.RANGE_UPPER_BOUND_DEFAULT) {
        if (lower_bound > upper_bound) {
            throw new Error('Lower bound cannot be greater than upper bound. Peer search failed.')
        }

        let query = this.socketRepo.createQueryBuilder('peer')
            .where(
                'ST_DWITHIN(peer.coords, ST_SetSRID(ST_MakePoint(:in_long1, :in_lat1),4326), :upper_bound, false)',
                { in_long1: socket.coords.coordinates[0], in_lat1: socket.coords.coordinates[1], upper_bound }
            )
        if (lower_bound > 0)
            query = query.andWhere(
                new NotBrackets((qb) => {
                    qb.where(
                        'ST_DWITHIN(peer.coords, ST_SetSRID(ST_MakePoint(:in_long2, :in_lat2),4326), :lower_bound, false)',
                        { in_long2: socket.coords.coordinates[0], in_lat2: socket.coords.coordinates[1], lower_bound }
                    )
                })
            )
        query = query.limit(1)
        return await query.getOne()
    }
}
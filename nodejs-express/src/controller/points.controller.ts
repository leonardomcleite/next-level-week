import { Request, Response } from 'express'
import connection from '../database/connection'

class PointsController {

  async findAll(request: Request, response: Response) {
    const {city, uf, items} = request.query
    const parsedItems = String(items).split(',').map(item => Number(item.trim()))

    let points = await connection('points')
    .join('point_items', 'points.id', '=', 'point_items.point_id')
    .whereIn('point_items.item_id', parsedItems)
    .where('city', String(city))
    .where('uf', String(uf))
    .distinct()
    .select('points.*')

    if (!points)
      return response.status(400).json({message: 'Pontos de coleta não encontrados'})

    return response.json(points)
  }

  async create(request: Request, response: Response) {
    const {
      image,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = request.body;
  
    const trx = await connection.transaction();

    const point = {
      image: image || '',
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    }
  
    const insertedIds = await trx('points').insert(point)
  
    const pointsItems = items.map((items_id: number) => ({
      points_id: insertedIds[0],
      items_id,
    }))
  
    await trx('points_items').insert(pointsItems)

    await trx.commit()
  
    return response.json({...point, id: insertedIds[0]});
  }

  async findById(request: Request, response: Response) {
    const {id} = request.params
    let point = await connection('points').where('id', id).first();

    if (!point)
      return response.status(400).json({message: 'Ponto de coleta não encontrado'})
    
    const items = await connection('items')
      .join('point_items', 'item.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)

    point = {...point, items}

    return response.json(point)
  }

}

export default PointsController;
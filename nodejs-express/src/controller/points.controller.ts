import { Request, Response } from 'express'
import connection from '../database/connection'

class PointsController {

  async findAll(request: Request, response: Response) {
    const {city, uf, items} = request.query

    let parsedItems: number[] = [];
    String(items).split(',').forEach(item => {
      if (!isNaN(Number(item.trim())))
        parsedItems.push(Number(item.trim()))
    });

    let points = await connection('points')
    .join('points_items', 'points.id', '=', 'points_items.point_id')
    .whereIn('points_items.item_id', parsedItems)
    .where('city', String(city))
    .where('uf', String(uf))
    .distinct()
    .select('points.*')


    if (!points)
      return response.status(400).json({message: 'Pontos de coleta não encontrados'})

    const serializedPoints = points.map(point => {
      return {
        ...point,
        image_url: `http://192.168.15.98:3333/uploads/${point.image}`
      }
    });

    return response.json(serializedPoints)
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
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    }
  
    const insertedIds = await trx('points').insert(point)
  
    let parsedItems: number[] = [];
    String(items).split(',').forEach(item => {
      if (!isNaN(Number(item.trim())))
        parsedItems.push(Number(item.trim()))
    });

    const pointsItems = parsedItems.map((item_id: number) => ({
      point_id: insertedIds[0],
      item_id,
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
      .join('points_items', 'items.id', '=', 'points_items.item_id')
      .where('points_items.point_id', id)
      .select('*')

    const serializedPoints = {...point, image_url: `http://192.168.15.98:3333/uploads/${point.image}`, items}

    return response.json(serializedPoints)
  }

}

export default PointsController;
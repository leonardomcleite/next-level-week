import { Request, Response } from 'express'
import connection from '../database/connection'

class ItemsController {

  async findAll(request: Request, response: Response) {
    let items = await connection('items').select('*');
    items = items.map(item => {
      return {
        id: item.id,
        title: item.title,
        image_url: `http://localhost:3333/uploads/${item.image}`
      }
    })
    return response.json(items)
  }

}

export default ItemsController
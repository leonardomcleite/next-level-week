import express from 'express'
import ItemsController from './controller/items.controller'
import PointsController from './controller/points.controller'

const itemsController = new ItemsController();
const pointsController = new PointsController();

const routes = express.Router();

routes.get('/items', itemsController.findAll)

routes.get('points/:id', pointsController.findById)
routes.get('points', pointsController.findAll)
routes.post('points', pointsController.create)

export default routes
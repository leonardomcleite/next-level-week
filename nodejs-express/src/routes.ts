import express from 'express'
import ItemsController from './controller/items.controller'
import PointsController from './controller/points.controller'
import multer from 'multer'
import multerConfig from './config/multer'
import { celebrate, Joi } from 'celebrate'

const itemsController = new ItemsController();
const pointsController = new PointsController();

const routes = express.Router();
const uplaods = multer(multerConfig)


routes.post('/points', 
  uplaods.single('image'),
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required()
    })
  }, {
    abortEarly: false
  }),
  pointsController.create)
routes.get('/points', pointsController.findAll)
routes.get('/points/:id', pointsController.findById)

routes.get('/items', itemsController.findAll)

export default routes
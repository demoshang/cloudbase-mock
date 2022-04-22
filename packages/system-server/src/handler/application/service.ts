/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-31 15:00:04
 * @LastEditTime: 2021-12-24 11:57:45
 * @Description: 
 */

import { Request, Response } from 'express'
import { getApplicationByAppid } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { permissions } from '../../permissions'
import { ApplicationServiceOperator } from '../../support/service-operator'

const { APPLICATION_UPDATE } = permissions
/**
 * The handler of starting application
 */
export async function handleStartApplicationService(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)

  if (!app)
    return res.status(422).send('app not found')

  // check permission
  const code = await checkPermission(uid, APPLICATION_UPDATE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const container_id = await ApplicationServiceOperator.start(app)

  return res.send({
    data: {
      service_id: container_id,
      appid: app.appid
    }
  })
}


/**
 * The handler of stopping application
 */
export async function handleStopApplicationService(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)

  if (!app)
    return res.status(422).send('app not found')

  // check permission
  const code = await checkPermission(uid, APPLICATION_UPDATE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const container_id = await ApplicationServiceOperator.stop(app)

  return res.send({
    data: {
      service_id: container_id,
      appid: app.appid
    }
  })
}
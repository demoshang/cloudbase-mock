import { V1Deployment } from '@kubernetes/client-node'
import { Injectable, Logger } from '@nestjs/common'
import { GetApplicationNamespaceById } from '../utils/getter'
import { MB, ResourceLabels } from '../constants'
import { PrismaService } from '../prisma.service'
import { StorageService } from '../storage/storage.service'
import { DatabaseService } from 'src/database/database.service'
import { ClusterService } from 'src/region/cluster/cluster.service'
import { Application, Region } from '@prisma/client'
import { RegionService } from 'src/region/region.service'

type ApplicationWithRegion = Application & { region: Region }

@Injectable()
export class InstanceService {
  private logger = new Logger('InstanceService')
  constructor(
    private readonly clusterService: ClusterService,
    private readonly regionService: RegionService,
    private readonly storageService: StorageService,
    private readonly databaseService: DatabaseService,
    private readonly prisma: PrismaService,
  ) {}

  async create(app: Application) {
    const appid = app.appid
    const labels = { [ResourceLabels.APP_ID]: appid }
    const region = await this.regionService.findByAppId(appid)
    const appWithRegion = { ...app, region } as ApplicationWithRegion

    const res = await this.get(appWithRegion)
    if (!res.deployment) {
      await this.createDeployment(appid, labels)
    }

    if (!res.service) {
      await this.createService(appWithRegion, labels)
    }
  }

  async createDeployment(appid: string, labels: any) {
    const namespace = GetApplicationNamespaceById(appid)
    const app = await this.prisma.application.findUnique({
      where: { appid },
      include: {
        configuration: true,
        bundle: true,
        runtime: true,
        region: true,
      },
    })

    // prepare params
    const limitMemory = app.bundle.limitMemory
    const limitCpu = app.bundle.limitCPU
    const requestMemory = app.bundle.requestMemory
    const requestCpu = app.bundle.requestCPU
    const max_old_space_size = ~~(limitMemory * 0.8)
    const max_http_header_size = 1 * MB
    const dependencies = app.configuration?.dependencies || []
    const dependencies_string = dependencies.join(' ')

    // db connection uri
    const database = await this.databaseService.findOne(appid)
    const dbConnectionUri = this.databaseService.getConnectionUri(
      app.region,
      database,
    )

    const storage = await this.storageService.findOne(appid)

    const env = [
      { name: 'DB_URI', value: dbConnectionUri },
      { name: 'APP_ID', value: app.appid },
      { name: 'OSS_ACCESS_KEY', value: storage.accessKey },
      { name: 'OSS_ACCESS_SECRET', value: storage.secretKey },
      {
        name: 'OSS_INTERNAL_ENDPOINT',
        value: app.region.storageConf.internalEndpoint,
      },
      {
        name: 'OSS_EXTERNAL_ENDPOINT',
        value: app.region.storageConf.externalEndpoint,
      },
      { name: 'OSS_REGION', value: app.region.name },
      {
        name: 'FLAGS',
        value: `--max_old_space_size=${max_old_space_size} --max-http-header-size=${max_http_header_size}`,
      },
      { name: 'DEPENDENCIES', value: dependencies_string },
    ]

    // merge env from app configuration, override if exists
    const extraEnv = app.configuration.environments || []
    extraEnv.forEach((e) => {
      const index = env.findIndex((x) => x.name === e.name)
      if (index > -1) {
        env[index] = e
      } else {
        env.push(e)
      }
    })

    // create deployment
    const data = new V1Deployment()
    data.metadata = { name: app.appid, labels }
    data.spec = {
      replicas: 1,
      selector: { matchLabels: labels },
      template: {
        metadata: { labels },
        spec: {
          terminationGracePeriodSeconds: 15,
          automountServiceAccountToken: false,
          containers: [
            {
              image: app.runtime.image.main,
              imagePullPolicy: 'Always',
              command: ['sh', '/app/start.sh'],
              name: app.appid,
              env,
              ports: [{ containerPort: 8000, name: 'http' }],
              resources: {
                limits: {
                  cpu: `${limitCpu}m`,
                  memory: `${limitMemory}Mi`,
                },
                requests: {
                  cpu: `${requestCpu}m`,
                  memory: `${requestMemory}Mi`,
                },
              },
              volumeMounts: [
                {
                  name: 'app',
                  mountPath: '/app',
                },
              ],
              startupProbe: {
                httpGet: {
                  path: '/_/healthz',
                  port: 'http',
                  httpHeaders: [{ name: 'Referer', value: 'startupProbe' }],
                },
                initialDelaySeconds: 0,
                periodSeconds: 3,
                timeoutSeconds: 3,
                failureThreshold: 240,
              },
              readinessProbe: {
                httpGet: {
                  path: '/_/healthz',
                  port: 'http',
                  httpHeaders: [{ name: 'Referer', value: 'readinessProbe' }],
                },
                initialDelaySeconds: 0,
                periodSeconds: 60,
                timeoutSeconds: 5,
                failureThreshold: 3,
              },
            },
          ],
          initContainers: [
            {
              name: 'init',
              image: app.runtime.image.init,
              imagePullPolicy: 'Always',
              command: ['sh', '/app/init.sh'],
              env,
              volumeMounts: [
                {
                  name: 'app',
                  mountPath: '/tmp/app',
                },
              ],
            },
          ],
          volumes: [
            {
              name: 'app',
              emptyDir: {},
            },
          ],
        },
      },
    }

    const appsV1Api = this.clusterService.makeAppsV1Api(app.region)
    const res = await appsV1Api.createNamespacedDeployment(namespace, data)

    this.logger.log(`create k8s deployment ${res.body?.metadata?.name}`)

    return res.body
  }

  async createService(app: ApplicationWithRegion, labels: any) {
    const namespace = GetApplicationNamespaceById(app.appid)
    const serviceName = app.appid
    const coreV1Api = this.clusterService.makeCoreV1Api(app.region)
    const res = await coreV1Api.createNamespacedService(namespace, {
      metadata: { name: serviceName, labels },
      spec: {
        selector: labels,
        type: 'ClusterIP',
        ports: [{ port: 8000, targetPort: 8000, protocol: 'TCP' }],
      },
    })
    this.logger.log(`create k8s service ${res.body?.metadata?.name}`)
    return res.body
  }

  async remove(app: Application) {
    const appid = app.appid
    const region = await this.regionService.findByAppId(appid)
    const { deployment, service } = await this.get(app)
    const appsV1Api = this.clusterService.makeAppsV1Api(region)
    const coreV1Api = this.clusterService.makeCoreV1Api(region)

    const namespace = GetApplicationNamespaceById(appid)
    if (deployment) {
      await appsV1Api.deleteNamespacedDeployment(appid, namespace)
    }
    if (service) {
      const name = appid
      await coreV1Api.deleteNamespacedService(name, namespace)
    }
  }

  async get(app: Application) {
    const region = await this.regionService.findByAppId(app.appid)
    const appWithRegion = { ...app, region }
    const deployment = await this.getDeployment(appWithRegion)
    const service = await this.getService(appWithRegion)
    return { deployment, service }
  }

  async getDeployment(app: ApplicationWithRegion) {
    const appid = app.appid
    const appsV1Api = this.clusterService.makeAppsV1Api(app.region)
    try {
      const namespace = GetApplicationNamespaceById(appid)
      const res = await appsV1Api.readNamespacedDeployment(appid, namespace)
      return res.body
    } catch (error) {
      if (error?.response?.body?.reason === 'NotFound') return null
      return null
    }
  }

  async getService(app: ApplicationWithRegion) {
    const appid = app.appid
    const coreV1Api = this.clusterService.makeCoreV1Api(app.region)

    try {
      const serviceName = appid
      const namespace = GetApplicationNamespaceById(appid)
      const res = await coreV1Api.readNamespacedService(serviceName, namespace)
      return res.body
    } catch (error) {
      return null
    }
  }
}

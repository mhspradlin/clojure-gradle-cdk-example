import * as cdk from '@aws-cdk/core';
import { ApplicationLoadBalancedFargateService } from '@aws-cdk/aws-ecs-patterns';
import { ICluster, ContainerImage } from '@aws-cdk/aws-ecs';
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';
import { HttpApi, HttpMethod, IApi, VpcLink } from '@aws-cdk/aws-apigatewayv2';
import { HttpAlbIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';


export interface AppServiceProps extends cdk.StackProps {
  cluster: ICluster
}

export class AppService extends cdk.Stack {
  public readonly api: IApi;

  constructor(scope: cdk.Construct, id: string, props: AppServiceProps) {
    super(scope, id, props);

    const appImageAsset = new DockerImageAsset(this, 'FinchImage', {
      directory: this.node.tryGetContext("server-docker-dir")
    });
    
    const fargateService = new ApplicationLoadBalancedFargateService(this, 'FinchService', {
      desiredCount: 1,
      publicLoadBalancer: false,
      cluster: props.cluster,
      taskImageOptions: {
        image: ContainerImage.fromDockerImageAsset(appImageAsset),
        containerPort: 3000 // The server listens on port 3000
      }
    });

    const vpcLink = new VpcLink(this, 'FinchServiceLink', {
      vpc: fargateService.cluster.vpc
    });

    const apiGateway = new HttpApi(this, 'FinchApiGateway', {
      description: "API for Finch App",
    });
    apiGateway.addRoutes({
      path: "/api/hello",
      methods: [HttpMethod.GET],
      integration: new HttpAlbIntegration({
        method: HttpMethod.GET,
        vpcLink,
        listener: fargateService.listener
      })
    })
    this.api = apiGateway;
  }
}

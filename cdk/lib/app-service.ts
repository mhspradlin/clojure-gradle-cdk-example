import * as cdk from '@aws-cdk/core';
import { ApplicationLoadBalancedFargateService } from '@aws-cdk/aws-ecs-patterns';
import { ICluster, ContainerImage } from '@aws-cdk/aws-ecs';
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';
import { join } from "path";

export interface AppServiceProps extends cdk.StackProps {
  cluster: ICluster
}

export class AppService extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: AppServiceProps) {
    super(scope, id, props);

    console.info("blah")

    const appImageAsset = new DockerImageAsset(this, 'FinchImage', {
      directory: join(__dirname, "../test-image-directory")
    });
    
    new ApplicationLoadBalancedFargateService(this, 'FinchService', {
      desiredCount: 1,
      publicLoadBalancer: false,
      cluster: props.cluster,
      taskImageOptions: {
        image: ContainerImage.fromDockerImageAsset(appImageAsset)
      }
    });
  }
}

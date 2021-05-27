import * as cdk from '@aws-cdk/core';
import { IVpc } from '@aws-cdk/aws-ec2';
import { ICluster, Cluster } from '@aws-cdk/aws-ecs';

export interface AppClusterProps extends cdk.StackProps {
  vpc: IVpc
}

export class AppCluster extends cdk.Stack {
  public readonly cluster: ICluster;

  constructor(scope: cdk.Construct, id: string, props: AppClusterProps) {
    super(scope, id, props);

    this.cluster = new Cluster(this, 'AppCluster', {
      enableFargateCapacityProviders: true,
      vpc: props.vpc
    });
  }
}

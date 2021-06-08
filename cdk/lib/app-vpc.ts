import * as cdk from '@aws-cdk/core';
import { Vpc } from '@aws-cdk/aws-ec2';

export class AppVpc extends cdk.Stack {
  public readonly vpc: Vpc;
  
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new Vpc(this, 'Vpc', {
      maxAzs: 2, // The ALB will require at least two subnets in different AZs
      natGateways: 1 // Save on NAT gateway costs by only having one
    });
  }
}
